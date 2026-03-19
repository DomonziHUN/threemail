"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, UploadCloud, CheckCircle2, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function KycStepper() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for images (Base64 strings)
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  // Webcam Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  // Stop camera when unmounting
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Kérlek, csak képet tölts fel!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Nem sikerült hozzáférni a kamerához. Kérlek engedélyezd a böngésződben!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      setStreamActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      const { videoWidth, videoHeight } = videoRef.current;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      context?.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
      
      const base64 = canvasRef.current.toDataURL("image/jpeg", 0.8);
      setSelfieImage(base64);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setSelfieImage(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage || !selfieImage) {
      toast.error("Kérlek készíts el minden felvételt!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontId: frontImage,
          backId: backImage,
          selfie: selfieImage,
        }),
      });

      if (res.ok) {
        toast.success("Sikeres ügyfél-azonosítás! Az anyagokat beküldtük.");
        // Hard frissítés hogy eltűnjön a form és az adatbázis beállítsa az elbírálást
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Hálózati hiba történt.");
      }
    } catch (err) {
      toast.error("Váratlan hiba történt az azonosítás során.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Léptető fejléc */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-in-out" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-colors ${
              step >= s ? "bg-primary border-primary text-primary-foreground" : "bg-card border-muted text-muted-foreground"
            }`}
          >
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
        ))}
      </div>

      <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <CardContent className="p-6">
          
          {/* 1. LÉPÉS: Előlap */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Azonosító Okmány (Előlap)
                </h2>
                <p className="text-sm text-muted-foreground">
                  Kérlek töltsd fel vagy fotózd le a személyi igazolványod vagy jogosítványod elülső, arcképes oldalát.
                </p>
              </div>

              <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/50 rounded-2xl cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden group">
                {frontImage ? (
                  <img src={frontImage} alt="Előlap" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-primary group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 mb-3" />
                    <p className="mb-2 text-sm font-semibold">Kattints a feltöltéshez</p>
                    <p className="text-xs text-muted-foreground">PNG vagy JPG</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, setFrontImage)}
                />
              </label>

              <Button 
                onClick={() => setStep(2)} 
                disabled={!frontImage} 
                className="w-full flex items-center justify-center gap-2"
              >
                Következő lépés <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* 2. LÉPÉS: Hátlap */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Azonosító Okmány (Hátlap)
                </h2>
                <p className="text-sm text-muted-foreground">
                  A biztonság kedvéért szükségünk van az okmányod hátoldalára is a chipes adatokkal.
                </p>
              </div>

              <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/50 rounded-2xl cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden group">
                {backImage ? (
                  <img src={backImage} alt="Hátlap" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-primary group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 mb-3" />
                    <p className="mb-2 text-sm font-semibold">Hátlap feltöltése</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, setBackImage)}
                />
              </label>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">Vissza</Button>
                <Button 
                  onClick={() => { setStep(3); startCamera(); }} 
                  disabled={!backImage} 
                  className="w-2/3 flex items-center justify-center gap-2"
                >
                  Tovább a Szelfihez <Camera className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 3. LÉPÉS: Szelfi */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Arcazonosítás
                </h2>
                <p className="text-sm text-muted-foreground">
                  Helyezd az arcodat a kamerába, és készítsünk egy biztonsági szelfit, hogy ellenőrizzük, a kártya a tiéd!
                </p>
              </div>

              <div className="relative w-full h-64 sm:h-80 bg-black rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
                {/* Rejtett Canvas a képmentéshez */}
                <canvas ref={canvasRef} className="hidden" />

                {!selfieImage ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className={`w-full h-full object-cover ${!streamActive ? 'hidden' : ''}`} 
                    />
                    {!streamActive && (
                      <div className="flex flex-col items-center gap-2 text-white/50">
                        <Camera className="w-12 h-12 animate-pulse" />
                        <span>Kamera indítása... engedélyezd felül!</span>
                      </div>
                    )}
                    
                    {/* Kamera arcfókusz keret vizuális extra */}
                    <div className="absolute inset-0 border-[6px] border-primary/30 rounded-full m-8 pointer-events-none scale-y-125" />
                  </>
                ) : (
                  <img src={selfieImage} alt="Selfie" className="w-full h-full object-cover" />
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={() => { stopCamera(); setStep(2); }} className="w-1/4">Vissza</Button>
                
                {!selfieImage ? (
                  <Button onClick={takePhoto} disabled={!streamActive} className="w-3/4 font-bold text-lg h-12 bg-primary hover:bg-primary/90">
                    <Camera className="mr-2 h-5 w-5" /> Fényképezés
                  </Button>
                ) : (
                  <div className="flex w-3/4 gap-2">
                    <Button variant="outline" onClick={retakePhoto} className="w-1/2">
                      Újrafotóz 🔄
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-1/2 bg-green-500 hover:bg-green-600 font-bold text-white">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Beküldés"}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="bg-yellow-500/10 text-yellow-600 p-3 rounded-lg text-xs flex items-start gap-2 border border-yellow-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>A fotókat end-to-end titkosítással tároljuk és miután az ügyintézők elbírálták, a profilod hitelesítetté (Verified) válik.</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
