import React, { useState } from "react";
import { Image as ImageIcon, CameraOff, Sparkles, X, Maximize2 } from "lucide-react";
import { GalleryTabProps, GalleryItem } from "./memberTabUtils";

export default function MemberGalleryView({
  dataWarning,
  gallery = [],
}: GalleryTabProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <>
      {dataWarning}

      <section
        aria-label="Club Photo & Event Gallery"
        className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6 text-white"
      >
        {/* Header */}
        <header className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ImageIcon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-tight text-white">
              Club Photo &amp; Event Gallery
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Moments, workshops, and highlights captured across our activities.
            </p>
          </div>
        </header>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {gallery.length > 0 ? (
            gallery.map((item: GalleryItem, idx: number) => {
              const uniqueKey = item._id || item.id || `gallery-item-${idx}`;
              const imageSrc = item.imageUrl || item.url;
              const title = item.title || "Club Activity";

              return (
                <article
                  key={uniqueKey}
                  onClick={() => imageSrc && setSelectedImage(item)}
                  className={`group relative bg-[#03070E] border border-white/10 hover:border-emerald-500/30 p-3 rounded-2xl space-y-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 ${
                    imageSrc ? "cursor-pointer" : ""
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-44 sm:h-48 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                    {imageSrc ? (
                      <>
                        <img
                          src={imageSrc}
                          alt={title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2.5">
                          <span className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white/80 border border-white/10">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-600">
                        <ImageIcon className="w-8 h-8 opacity-40" />
                        <span className="text-[10px] font-mono">No preview</span>
                      </div>
                    )}

                    {item.category && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-black/60 border border-white/10 text-emerald-400 backdrop-blur-md">
                          {item.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Metadata */}
                  <div className="space-y-0.5 px-1">
                    <h2 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {title}
                    </h2>
                    {item.caption && (
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            /* Empty State */
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-[#03070E] border border-white/5 rounded-2xl space-y-3">
              <div className="p-3 rounded-full bg-slate-900 border border-white/10 text-slate-500">
                <CameraOff className="w-6 h-6" />
              </div>
              <p className="text-sm font-mono text-slate-400">
                No gallery media available yet.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal (Click to View Full Image) */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#03070E] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition-colors"
              aria-label="Close image preview"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-h-[75vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedImage.imageUrl || selectedImage.url}
                alt={selectedImage.title || "Expanded image view"}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {selectedImage.title || "Club Activity"}
                </h3>
                {selectedImage.caption && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedImage.caption}
                  </p>
                )}
              </div>
              {selectedImage.date && (
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  {selectedImage.date}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}