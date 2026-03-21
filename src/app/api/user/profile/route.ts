import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await requireAuth();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        country: true,
        city: true,
        street: true,
        zipCode: true,
        emailVerified: true,
        addressLocked: true,
        balanceHuf: true,
        referralCode: true,
        paymentReference: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    return NextResponse.json({ user: dbUser });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        addressLocked: true,
        country: true,
        city: true,
        street: true,
        zipCode: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Felhasználó nem található" }, { status: 404 });
    }

    const addressFields = ['country', 'city', 'street', 'zipCode'];
    const hasAddressData = addressFields.some(field => 
      currentUser[field as keyof typeof currentUser] && 
      currentUser[field as keyof typeof currentUser] !== ""
    );
    const isUpdatingAddress = addressFields.some(field => 
      parsed.data[field as keyof typeof parsed.data] !== undefined
    );

    if (currentUser.addressLocked && isUpdatingAddress) {
      return NextResponse.json(
        { message: "A lakcím már nem módosítható" },
        { status: 400 }
      );
    }

    const updateData: any = { ...parsed.data };
    
    if (!hasAddressData && isUpdatingAddress) {
      const newAddressComplete = addressFields.every(field => 
        parsed.data[field as keyof typeof parsed.data] || 
        currentUser[field as keyof typeof currentUser]
      );
      
      if (newAddressComplete) {
        updateData.addressLocked = true;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if ((error as Error).message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ message: "Nem vagy bejelentkezve" }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ message: "Szerver hiba" }, { status: 500 });
  }
}
