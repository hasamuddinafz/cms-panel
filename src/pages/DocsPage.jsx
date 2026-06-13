import { useState } from "react";
import ReactMarkdown from "react-markdown";
import PanelHelmet from "../components/layout/PanelHelmet";
import { cn } from "../lib/utils";

const SECTIONS = [
  {
    id: "overview",
    title: "Genel Bakış",
    content: `
# NEXUS CMS — Kullanım Rehberi

NEXUS CMS, kurumunuzun web sitesi içeriğini tek bir admin panelinden yönetmenizi sağlayan **headless, API-first** bir içerik yönetim sistemidir.

## Temel Kavramlar

| Kavram | Açıklama |
|--------|----------|
| **Sayfa Modeli** | Bir sayfa tipinin şemasını tanımlar (örn. Anasayfa, Blog Yazısı). |
| **İçerik (Instance)** | Bir sayfa modelinin doldurulmuş halidir. |
| **Section** | Sayfanın mantıksal bölümü — tekrarlanabilir olabilir. |
| **Field** | Section içindeki veri alanı: metin, resim, bağlantı vb. |
| **Medya** | Yüklenen resim, belge ve video dosyaları. |
| **Menü** | Sitenin navigasyon yapısı (navbar, footer). |
| **Rol / Yetki** | Hangi kullanıcının hangi işlemi yapabileceğini belirler. |
    `.trim(),
  },
  {
    id: "page-models",
    title: "Sayfa Modeli Oluşturma",
    content: `
# Sayfa Modeli Oluşturma

Sayfa modeli, bir sayfa tipinin **şemasını** (yapısını) tanımlar. Kod yazmadan, panelden oluşturulur.

## Adım Adım

1. Sol menüden **Sayfa Modelleri** sayfasına gidin.
2. Sağ üstteki **"Yeni Model"** butonuna tıklayın.
3. Aşağıdaki bilgileri doldurun:

| Alan | Açıklama |
|------|----------|
| **Ad** | Modelin okunabilir adı (örn. "Blog Yazısı") |
| **Key** | URL-friendly tanımlayıcı (örn. \`blog-post\`) |
| **Singleton** | İşaretlenirse yalnızca 1 içerik oluşturulabilir (örn. Anasayfa) |
| **Icon** | Lucide ikon adı |

4. **Section ekle** butonuyla sayfanın bölümlerini tanımlayın.
5. Her section'a **field** ekleyin:

| Tip | Kullanım |
|-----|---------|
| \`text\` | Tek satır metin |
| \`richtext\` | TipTap zengin metin editörü |
| \`asset\` | Görsel / belge / video seçimi |
| \`boolean\` | Açık/Kapalı toggle |
| \`select\` | Sabit seçenek listesi |
| \`repeater\` | Tekrarlanabilir alt alan grubu |
| \`link\` | URL + etiket + yeni sekme |
| \`icon\` | Lucide ikon seçici |

6. **"Kaydet"** ile modeli oluşturun.

> **İpucu:** \`translatable: true\` işaretlenen field'lar, içerik editöründe her dil için ayrı tab gösterir.
    `.trim(),
  },
  {
    id: "content",
    title: "İçerik Ekleme",
    content: `
# İçerik Ekleme ve Yönetimi

## Yeni İçerik Oluşturma

1. Sol menüden **İçerik** sayfasına gidin.
2. **"Yeni İçerik"** butonuna tıklayın, model seçin.
3. **Slug** girin — bu değer sitenizde URL olarak kullanılır.
4. İçerik formunda her section'ı doldurun:
   - Translatable field'lar için **dil tab'larını** kullanın
   - Repeater section'larda **"+ Ekle"** ile yeni öğe eklenebilir
   - Asset field'larında **"Dosya Seç"** ile medya kütüphanesinden seçim yapılır
5. **"Taslak Kaydet"** ile yayınlamadan önce saklayın.

## Durum Yönetimi

| Durum | Açıklama |
|-------|----------|
| **Taslak** | Sadece editörler görebilir, public API'de görünmez |
| **Yayında** | Public API üzerinden erişilebilir |
| **Arşiv** | Yayından alınmış, arşivde saklı |

- Taslak → Yayınla: Liste ekranındaki yeşil onay ikonuna tıklayın (\`pages.publish\` yetkisi gerekir)
- Yayında → Arşiv: Liste ekranındaki arşiv ikonuna tıklayın

## Arama ve Filtreleme

- Üstteki arama kutusuna slug veya içerik ara
- Durum filtresi ile sadece belirli durumdaki içerikleri göster
- **CSV / Excel** butonlarıyla filtrelenmiş listeyi dışa aktar
    `.trim(),
  },
  {
    id: "media",
    title: "Medya Yükleme",
    content: `
# Medya Kütüphanesi

## Dosya Yükleme

### Yöntem 1 — Medya Sayfasından
1. Sol menüden **Medya** sayfasına gidin.
2. **"Dosya Yükle"** butonuna tıklayın.
3. Dosya türüne göre otomatik klasörlenir:
   - \`uploads/images/\` — Resimler
   - \`uploads/documents/\` — Belgeler
   - \`uploads/videos/\` — Videolar

### Yöntem 2 — İçerik Formundan
\`asset\` tipindeki bir field'da **"Dosya Seç"** butonuna tıkladığınızda açılan modaldan doğrudan yükleme yapabilirsiniz.

## Dosya Limitleri

| Tip | Maksimum Boyut |
|-----|---------------|
| Resim | 5 MB |
| Belge | 20 MB |
| Video | 100 MB |

## Thumbnail

Yüklenen **resimler** için otomatik küçük resim (thumbnail) oluşturulur.

## Alt Text

Resimler için liste ekranında kalem ikonuna tıklayarak dil bazlı **alt text** girebilirsiniz.
    `.trim(),
  },
  {
    id: "roles",
    title: "Rol ve Yetki Yönetimi",
    content: `
# Rol ve Yetki Yönetimi

NEXUS CMS dinamik bir rol/yetki sistemi kullanır — yöneticiler kendi rollerini oluşturur.

## Rol Oluşturma

1. **Roller & Yetkiler** sayfasına gidin (\`roles.manage\` yetkisi gerekir).
2. **"Yeni Rol"** butonuna tıklayın.
3. Rol adı ve açıklama girin.
4. **Yetki Matrisi**'nde modül bazlı yetkileri seçin:

| Modül | Yetkiler |
|-------|---------|
| Pages | view, create, edit, delete, publish |
| Media | view, upload, delete |
| Menus | manage |
| Settings | general.edit, seo.edit, smtp.edit, languages.manage |
| Users | manage |
| Roles | manage |
| Dashboard | view |
| Activity | view |

5. **"Kaydet"** ile rolü oluşturun.

> **Not:** \`SuperAdmin\` sistem rolüdür, değiştirilemez ve silinemez.

## Kullanıcıya Rol Atama

1. **Kullanıcılar** sayfasına gidin.
2. İlgili kullanıcı satırındaki rol atama ikonuna tıklayın.
3. Açılan modalda bir veya birden fazla rol seçin.
4. **"Kaydet"** ile güncelleyin.

Bir kullanıcıya birden fazla rol atanabilir — yetkiler **birleştirilir** (OR mantığı).
    `.trim(),
  },
  {
    id: "settings",
    title: "Ayarlar",
    content: `
# Sistem Ayarları

## Genel Ayarlar
Site adı, logo, favicon, iletişim bilgileri ve sosyal medya linkleri.

## SEO Ayarları
- **Title Şablonu** — Her sayfa başlığına eklenen varsayılan son ek
- **Default Meta Description** — Sayfa özel meta yoksa kullanılır
- **OG Image** — Open Graph paylaşım görseli
- **Google Analytics / GTM ID** — Analitik entegrasyonu

## SMTP Ayarları
E-posta gönderimi için SMTP yapılandırması. **Şifre alanı** her zaman gizlenir (\`••••••\`); değiştirmek istemiyorsanız boş bırakın — mevcut şifre korunur.

## Diller

Yeni dil eklemek için **Ayarlar → Diller** sayfasını kullanın:
1. **"Dil Ekle"** butonuna tıklayın
2. Dil kodu (örn. \`en\`), ad ve bayrak ikonu girin
3. **Varsayılan Dil** olarak işaretlemek istiyorsanız toggle'ı açın
4. Kaydedin — yeni dil içerik formlarında otomatik tab olarak görünür
    `.trim(),
  },
  {
    id: "menus",
    title: "Menü Yönetimi",
    content: `
# Menü Yönetimi

Dört ayrı menü yönetilir:

| Anahtar | Kullanım |
|---------|---------|
| \`navbar-desktop\` | Masaüstü üst navigasyon |
| \`navbar-mobile\` | Mobil üst navigasyon |
| \`footer-desktop\` | Masaüstü alt bölüm |
| \`footer-mobile\` | Mobil alt bölüm |

## Menü Öğesi Özellikleri

- **Etiket** — Her dilde ayrı metin
- **Link Tipi** — \`page\` (dahili), \`external\` (harici URL)
- **İkon** — Lucide ikon adı (opsiyonel)
- **Yeni Sekme** — \`_blank\` olarak açılır mı?
- **Alt Öğeler** — İç içe menü yapısı

## Düzenleme

1. **Menüler** sayfasından düzenlemek istediğiniz menüyü seçin.
2. **"+ Öğe Ekle"** ile yeni bağlantı ekleyin.
3. Öğeleri sürükleyerek **sıralayın** veya **iç içe** yerleştirin.
4. **"Kaydet"** ile güncelleyin.
    `.trim(),
  },
  {
    id: "api",
    title: "Public API",
    content: `
# Public API

Frontend uygulamanız CMS içeriğini aşağıdaki endpoint'ler üzerinden tüketir.

## Endpoint'ler

\`\`\`
GET /api/public/pages/{modelKey}/{slug}?lang=tr
GET /api/public/pages/{modelKey}?lang=tr&page=1&pageSize=10
GET /api/public/menus/{key}?lang=tr
GET /api/public/settings?lang=tr
GET /api/public/languages
\`\`\`

## Örnek Yanıt

\`\`\`json
{
  "id": "...",
  "modelKey": "blog-post",
  "slug": "yapay-zeka-nedir",
  "contentJson": {
    "tr": { "hero": { "title": "Yapay Zeka Nedir?" } }
  },
  "viewCount": 142,
  "publishedAt": "2026-06-13T10:00:00Z"
}
\`\`\`

## Cache

Public endpoint'ler 5 dakika **output cache** ile korunur.
    `.trim(),
  },
];

const markdownClass = [
  "prose prose-sm max-w-none",
  "prose-headings:font-semibold prose-headings:text-foreground",
  "prose-h1:text-xl prose-h2:text-base prose-h3:text-sm",
  "prose-p:text-sm prose-p:text-foreground/90 prose-p:leading-relaxed",
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
  "prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:text-foreground",
  "prose-pre:bg-muted prose-pre:rounded-lg prose-pre:text-xs",
  "prose-table:text-sm prose-th:text-left prose-th:font-semibold",
  "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
  "prose-strong:text-foreground prose-strong:font-semibold",
  "prose-li:text-sm prose-li:text-foreground/90",
].join(" ");

export default function DocsPage() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];

  return (
    <>
      <PanelHelmet title="Dokümantasyon" />

      <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
        <nav className="w-52 shrink-0">
          <div className="sticky top-0 space-y-0.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
              Konular
            </p>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  active === s.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {s.title}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0 rounded-xl border bg-card p-6">
          <ReactMarkdown className={markdownClass}>
            {section.content}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}
