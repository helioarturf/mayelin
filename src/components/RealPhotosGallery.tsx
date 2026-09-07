import { useState, useEffect, useRef, ChangeEvent, DragEvent, MouseEvent } from 'react';
import {
  Camera,
  ExternalLink,
  Upload,
  Sparkles,
  Maximize2,
  X,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Image as ImageIcon,
} from 'lucide-react';
import { SCHOOL_IMAGES, SCHOOL_CONTACT } from '../data/mockData';

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  tag: string;
  source: 'facebook_real' | 'user_upload' | 'campus';
  dateAdded?: string;
}

const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'fb-profile-real',
    url: SCHOOL_IMAGES.mayelinRealProfile,
    caption: 'Identidade Oficial do Jardim Escola da Mayelin • Luanda, Angola',
    tag: 'Identidade & Fachada',
    source: 'facebook_real',
    dateAdded: 'Facebook Oficial'
  },
  {
    id: 'campus-classroom',
    url: SCHOOL_IMAGES.heroClassroom,
    caption: 'Salas de aula climatizadas com cantinho da leitura e blocos pedagógicos',
    tag: 'Salas de Aula',
    source: 'campus',
    dateAdded: 'Estrutura Escolar'
  },
  {
    id: 'campus-garden',
    url: SCHOOL_IMAGES.garden,
    caption: 'Horta pedagógica e vivência ao ar livre no pátio',
    tag: 'Horta & Natureza',
    source: 'campus',
    dateAdded: 'Estrutura Escolar'
  },
  {
    id: 'campus-cafeteria',
    url: SCHOOL_IMAGES.cafeteria,
    caption: 'Refeitório infantil supervisionado e nutrição pura para os pequenos',
    tag: 'Refeitório & Nutrição',
    source: 'campus',
    dateAdded: 'Estrutura Escolar'
  },
  {
    id: 'campus-nap',
    url: SCHOOL_IMAGES.napRoom,
    caption: 'Sala do soninho climatizada com berços individuais acolhedores',
    tag: 'Berçário & Soninho',
    source: 'campus',
    dateAdded: 'Estrutura Escolar'
  },
  {
    id: 'campus-gym',
    url: SCHOOL_IMAGES.gymPlayground,
    caption: 'Área de psicomotricidade e recreação com piso emborrachado',
    tag: 'Playground',
    source: 'campus',
    dateAdded: 'Estrutura Escolar'
  }
];

export default function RealPhotosGallery() {
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem('mayelin_gallery_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_PHOTOS;
  });

  const [selectedTag, setSelectedTag] = useState<string>('Todas');
  const [lightboxPhoto, setLightboxPhoto] = useState<PhotoItem | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('mayelin_gallery_photos', JSON.stringify(photos));
    } catch {
      // ignore
    }
  }, [photos]);

  const tags = ['Todas', 'Identidade & Fachada', 'Salas de Aula', 'Horta & Natureza', 'Refeitório & Nutrição', 'Berçário & Soninho', 'Playground'];

  const filteredPhotos = selectedTag === 'Todas'
    ? photos
    : photos.filter((p) => p.tag === selectedTag);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: PhotoItem[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (base64) {
          const newPhoto: PhotoItem = {
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            url: base64,
            caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            tag: selectedTag === 'Todas' ? 'Salas de Aula' : selectedTag,
            source: 'user_upload',
            dateAdded: 'Foto Adicionada'
          };
          setPhotos((prev) => [newPhoto, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });

    setTimeout(() => {
      setIsUploading(false);
    }, 400);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeletePhoto = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (lightboxPhoto?.id === id) {
      setLightboxPhoto(null);
    }
  };

  const handleCopyFbLink = () => {
    navigator.clipboard?.writeText(SCHOOL_CONTACT.facebookUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <section id="galeria-real" className="py-16 md:py-24 bg-[#fffaf6] border-b border-[#eee0d6]/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 text-[#ed145b] font-bold text-xs font-['Nunito_Sans'] mb-3">
              <Camera className="w-4 h-4" />
              <span>Fotos Reais & Facebook Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold tracking-tight">
              Galeria de Fotos do Jardim Escola da Mayelin
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-['Nunito_Sans'] text-[#5c3f42] mt-2">
              Veja fotos reais obtidas da página oficial do Facebook em Luanda, Angola, e os espaços pedagógicos preparados com carinho para as crianças.
            </p>
          </div>

          {/* Direct Facebook Link & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={SCHOOL_CONTACT.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="facebook-official-gallery-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1877F2] text-white text-xs md:text-sm font-['Nunito_Sans'] font-bold hover:bg-[#0c63d4] transition-colors shadow-sm shadow-blue-200"
            >
              <span>Ver Álbum no Facebook</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              id="copy-fb-link-btn"
              onClick={handleCopyFbLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white border border-[#eee0d6] text-[#5c3f42] text-xs font-bold hover:bg-amber-50 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-[#fd9924]" />
              <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        {/* Facebook Page Highlight Banner Card */}
        <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-white playful-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-l-[#1877F2]">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-blue-100 shrink-0 shadow-inner bg-amber-50">
              <img
                src={SCHOOL_IMAGES.mayelinRealProfile}
                alt="Foto de Perfil Real do Jardim Escola da Mayelin no Facebook"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-['Quicksand'] font-bold text-[#211a14]">
                  Jardim Escola da Mayelin | Luanda
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Verificado
                </span>
              </div>
              <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42] mt-0.5">
                Centralidade do Kilamba / Belas • Província de Luanda, Angola
              </p>
              <p className="text-[11px] font-['Nunito_Sans'] text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Matrículas e Visitas Abertas para Berçário, Maternal e Jardim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              id="upload-photos-toggle-btn"
              onClick={() => fileInputRef.current?.click()}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 text-xs md:text-sm font-['Nunito_Sans'] font-bold transition-all shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Adicionar Foto da Escola</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Drag and Drop Zone Banner (Compact) */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="mb-8 p-4 rounded-2xl border-2 border-dashed border-[#fd9924]/50 bg-amber-50/40 hover:bg-amber-50/80 transition-colors cursor-pointer text-center flex items-center justify-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-[#fd9924] group-hover:scale-110 transition-transform">
            <ImageIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">
            <strong className="text-[#211a14]">Tem fotos do álbum do Facebook?</strong> Arraste e solte arquivos de imagem aqui ou clique para selecionar fotos e exibir na galeria.
          </p>
          {isUploading && (
            <span className="text-xs text-[#ed145b] font-bold animate-pulse">
              Processando...
            </span>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-xs font-['Nunito_Sans'] font-bold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-[#ed145b] text-white shadow-sm'
                  : 'bg-white text-[#5c3f42] border border-[#eee0d6] hover:bg-pink-50'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative bg-white rounded-3xl overflow-hidden playful-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Photo Image Container */}
              <div
                className="relative aspect-[4/3] bg-amber-50 overflow-hidden cursor-pointer"
                onClick={() => setLightboxPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback if local image can't be rendered
                    const target = e.currentTarget;
                    if (target.src !== SCHOOL_IMAGES.heroClassroom) {
                      target.src = SCHOOL_IMAGES.heroClassroom;
                    }
                  }}
                />

                {/* Source Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {photo.source === 'facebook_real' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1877F2] text-white text-[11px] font-['Nunito_Sans'] font-bold shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      Foto Real Facebook
                    </span>
                  ) : photo.source === 'user_upload' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-['Nunito_Sans'] font-bold shadow-xs">
                      <Camera className="w-3 h-3" />
                      Foto Adicionada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-['Nunito_Sans'] font-bold shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      Estrutura
                    </span>
                  )}
                </div>

                {/* Delete button for user uploads */}
                {photo.source === 'user_upload' && (
                  <button
                    type="button"
                    onClick={(e) => handleDeletePhoto(photo.id, e)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remover foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Hover overlay with maximize icon */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="p-3 rounded-full bg-white/90 text-[#211a14] shadow-md">
                    <Maximize2 className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {/* Caption & Tag */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ed145b]">
                    {photo.tag}
                  </span>
                  <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] font-semibold mt-1 line-clamp-2">
                    {photo.caption}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[#eee0d6]/60 flex items-center justify-between text-[11px] text-[#5c3f42]">
                  <span>{photo.dateAdded || 'Jardim Escola da Mayelin'}</span>
                  <button
                    type="button"
                    onClick={() => setLightboxPhoto(photo)}
                    className="text-[#00a6c0] font-bold hover:underline"
                  >
                    Ampliar foto
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl playful-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo */}
            <div className="max-h-[70vh] bg-black/5 flex items-center justify-center overflow-hidden">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="max-h-[70vh] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Caption & Footer */}
            <div className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-pink-100 text-[#ed145b] text-xs font-bold font-['Nunito_Sans']">
                  {lightboxPhoto.tag}
                </span>
                <h4 className="text-base sm:text-lg font-['Quicksand'] font-bold text-[#211a14] mt-1.5">
                  {lightboxPhoto.caption}
                </h4>
                <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42] mt-0.5">
                  Jardim Escola da Mayelin • Kilamba, Belas, Luanda, Angola
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={SCHOOL_CONTACT.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1877F2] text-white text-xs font-bold font-['Nunito_Sans'] hover:bg-blue-700 transition-colors"
                >
                  <span>Álbum no Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
