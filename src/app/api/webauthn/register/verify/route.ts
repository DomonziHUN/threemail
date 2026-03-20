import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { rpID, origin } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { webAuthnChallenges: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

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

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (verification.verified && verification.registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

      await prisma.webAuthnCredential.create({
        data: {
          userId: user.id,
          credentialId: Buffer.from(credentialID).toString("base64"),
          publicKey: Buffer.from(credentialPublicKey).toString("base64"),
          counter,
          deviceType: body.response?.authenticatorAttachment || "platform",
          transports: body.response?.transports ? JSON.stringify(body.response.transports) : null,
        },
      });

      // Enable biometric authentication
      const settings = await prisma.securitySettings.findUnique({
        where: { userId: user.id },
      });

      if (settings) {
        await prisma.securitySettings.update({
          where: { userId: user.id },
          data: { biometricEnabled: true },
        });
      } else {
        await prisma.securitySettings.create({
          data: {
            userId: user.id,
            biometricEnabled: true,
          },
        });
      }

      // Delete used challenge
      await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } });

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error("Error verifying registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
