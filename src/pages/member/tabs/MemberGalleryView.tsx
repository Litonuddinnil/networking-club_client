import React from "react";
import { Image } from "lucide-react";
import { GalleryTabProps } from "./memberTabUtils";

export default function MemberGalleryView({
  dataWarning,
  gallery = [],
}: GalleryTabProps) {
  return (
    <>{dataWarning}
      <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto space-y-6 text-white">
        <h1 className="text-xl font-display font-extrabold text-white flex items-center space-x-2">
          <Image className="w-5 h-5 text-orange-500" />
          <span>Club Photo &amp; Event Gallery</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.length > 0 ? (
            gallery.map((g, idx) => (
              <div
                key={g._id || g.id || idx}
                className="bg-[#03070E] border border-white/10 p-3 rounded-2xl space-y-2"
              >
                <div className="h-40 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                  {g.imageUrl || g.url ? (
                    <img
                      src={g.imageUrl || g.url}
                      alt={g.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="w-8 h-8 text-slate-600" />
                  )}
                </div>
                <p className="text-xs font-bold text-white truncate">
                  {g.title || "Club Activity"}
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full p-8 text-center text-xs font-mono text-slate-500 bg-[#03070E] border border-white/5 rounded-2xl">
              No gallery media available.
            </div>
          )}
        </div>
      </div>
    </>
  );
}