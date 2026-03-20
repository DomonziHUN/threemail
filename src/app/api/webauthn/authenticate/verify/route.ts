import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { rpID, origin } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  try {
    const { email, response } = await req.json();

    if (!email || !response) {
      return NextResponse.json(
        { error: "Email and response required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        webAuthnCredentials: true,
        webAuthnChallenges: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the most recent challenge
    const challengeRecord = user.webAuthnChallenges
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (!challengeRecord) {
      return NextResponse.json({ error: "No challenge found" }, { status: 400 });
    }

    if (new Date() > challengeRecord.expiresAt) {
      await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } });
      return NextResponse.json({ error: "Challenge expired" }, { status: 400 });
    }

    // Find the credential
    const credentialId = Buffer.from(response.id, "base64url").toString("base64");
    const credential = user.webAuthnCredentials.find(
      (cred) => cred.credentialId === credentialId
    );

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(Buffer.from(credential.credentialId, "base64")),
        credentialPublicKey: new Uint8Array(Buffer.from(credential.publicKey, "base64")),
        counter: credential.counter,
      },
    });

    if (verification.verified) {
      // Update counter
      await prisma.webAuthnCredential.update({
        where: { id: credential.id },
        data: { counter: verification.authenticationInfo.newCounter },
      });

      // Delete used challenge
      await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } });

      return NextResponse.json({
        verified: true,
        userId: user.id,
        email: user.email,
      });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error("Error verifying authentication:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
