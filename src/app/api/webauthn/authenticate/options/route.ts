import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { rpID, CHALLENGE_TIMEOUT } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { webAuthnCredentials: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.webAuthnCredentials.length === 0) {
      return NextResponse.json(
        { error: "No credentials registered" },
        { status: 400 }
      );
    }

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.webAuthnCredentials.map((cred) => ({
        id: new Uint8Array(Buffer.from(cred.credentialId, "base64")),
        type: "public-key",
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
      userVerification: "preferred",
    });

    // Store challenge
    await prisma.webAuthnChallenge.deleteMany({
      where: { userId: user.id },
    });

    await prisma.webAuthnChallenge.create({
      data: {
        userId: user.id,
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + CHALLENGE_TIMEOUT),
      },
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error generating authentication options:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
