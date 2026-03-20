import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { rpName, rpID, CHALLENGE_TIMEOUT } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { webAuthnCredentials: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.email,
      userDisplayName: user.fullName,
      attestationType: "none",
      excludeCredentials: user.webAuthnCredentials.map((cred) => ({
        id: new Uint8Array(Buffer.from(cred.credentialId, "base64")),
        type: "public-key",
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    // Store challenge in database
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
    console.error("Error generating registration options:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
