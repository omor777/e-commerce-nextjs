"use client";

import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRef } from "react";

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

export function ImageUploader({
  value = [],
  onChange,
  disabled,
}: ImageUploaderProps) {
  const valueRef = useRef<string[]>(value);

  const handleSuccess = (url: string) => {
    const updated = [...valueRef.current, url];
    valueRef.current = updated;
    onChange(updated);
  };

  const handleRemove = (urlToRemove: string) => {
    const updated = valueRef.current.filter((url) => url !== urlToRemove);
    valueRef.current = updated;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square rounded-md overflow-hidden border border-border"
            >
              <Image
                src={url}
                alt="Product image"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(url)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        signatureEndpoint="/api/sign-cloudinary-params"
        onSuccess={(result) => {
          if (typeof result.info === "object" && "secure_url" in result.info) {
            handleSuccess(result.info.secure_url);
          }
        }}
        options={{
          multiple: true,
          maxFiles: 4,
          clientAllowedFormats: ["image"],
          folder: "Gentle Vibes",
        }}
      >
        {({ open }) => {
          return (
            <Button
              type="button"
              variant="outline"
              onClick={() => open()}
              disabled={disabled}
              className="w-full h-24 border-dashed border-2"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="size-6" />
                <span>Click or drag & drop images here</span>
              </div>
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}
