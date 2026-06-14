import { useState } from "react";
import {
  BookOpen, Layers, FileText, Image, Shield, Settings,
  Menu, Globe, ChevronRight, Info, Lightbulb, Terminal,
  CheckCircle, AlertCircle, Inbox, Rss,
} from "lucide-react";
import PanelHelmet from "../components/layout/PanelHelmet";
import { cn } from "../lib/utils";

/* ─── Nav sections ─── */
const SECTIONS = [
  { id: "overview",     label: "Genel Bakış",            icon: BookOpen },
  { id: "page-models",  label: "Sayfa Modeli Oluşturma", icon: Layers },
  { id: "content",      label: "İçerik Yönetimi",        icon: FileText },
  { id: "media",        label: "Medya Yükleme",          icon: Image },
  { id: "roles",        label: "Rol & Yetki Yönetimi",   icon: Shield },
  { id: "settings",     label: "Ayarlar",                icon: Settings },
  { id: "menus",        label: "Menü Yönetimi",          icon: Menu },
  { id: "contact",      label: "İletişim & Mail",        icon: Inbox },
  { id: "subscribers",  label: "Aboneler",               icon: Rss },
  { id: "api",          label: "Public API",             icon: Terminal },
];

/* ─── Shared doc components ─── */
function DocH1({ children }) {
  return <h1 className="text-2xl font-bold text-foreground mb-1">{children}</h1>;
}
function DocH2({ children }) {
  return <h2 className="text-base font-semibold text-foreground mt-8 mb-3 pb-2 border-b">{children}</h2>;
}
function DocP({ children }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>;
}
function DocLead({ children }) {
  return <p className="text-sm text-muted-foreground leading-relaxed mb-6 border-l-2 border-primary/40 pl-3">{children}</p>;
}
function DocTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-sm">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DocCode({ children }) {
  return <code className="bg-muted text-primary rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>;
}
function DocCodeBlock({ children }) {
  return (
    <pre className="bg-sidebar text-sidebar-foreground rounded-xl p-4 text-xs font-mono overflow-x-auto my-4 leading-relaxed">
      {children}
    </pre>
  );
}
function DocTip({ children }) {
  return (
    <div className="flex gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 my-4">
      <Lightbulb size={16} className="text-primary mt-0.5 shrink-0" />
      <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}
function DocWarning({ children }) {
  return (
    <div className="flex gap-3 bg-destructive/5 border border-destructive/20 rounded-xl p-4 my-4">
      <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
      <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>
    </div>
  );
}
function DocInfo({ children }) {
  return (
    <div className="flex gap-3 bg-muted border rounded-xl p-4 my-4">
      <Info size={16} className="text-muted-foreground mt-0.5 shrink-0" />
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
function DocStep({ number, title, children }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {number}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
function DocBadge({ children, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    green:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    gray:   "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5", colors[color])}>
      {children}
    </span>
  );
}

/* ─── Section content components ─── */
function SectionOverview() {
  return (
    <div>
      <DocH1>NEXUS CMS — Kullanım Rehberi</DocH1>
      <DocLead>
        Kurumunuzun web sitesi içeriğini tek bir admin panelinden yönetmenizi sağlayan
        headless, API-first bir içerik yönetim sistemi.
      </DocLead>

      <DocH2>Temel Kavramlar</DocH2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          { icon: Layers,   title: "Sayfa Modeli",      desc: "Bir sayfa tipinin şemasını tanımlar. Hangi bölüm ve alanların olacağını belirler." },
          { icon: FileText, title: "İçerik (Instance)",  desc: "Bir sayfa modelinin doldurulmuş halidir. Her blog yazısı bir instance'tır." },
          { icon: Image,    title: "Medya",              desc: "Yüklenen resim, belge ve video dosyaları tek merkezden yönetilir. Sürükle-bırak desteklenir." },
          { icon: Menu,     title: "Menü",               desc: "Sitenin navigasyon yapısı; navbar ve footer için ayrı ayrı tanımlanır." },
          { icon: Shield,   title: "Rol / Yetki",        desc: "Hangi kullanıcının hangi işlemi yapabileceğini belirler." },
          { icon: Globe,    title: "Dil",                desc: "Çoklu dil desteği. Translatable alanlar her dil için ayrı girilir." },
          { icon: Inbox,    title: "İletişim & Mail",    desc: "Ziyaretçi mesajları, otomatik yanıt, mail şablonları ve toplu bülten gönderimi." },
          { icon: Rss,      title: "Aboneler",           desc: "Abonelik sistemi açık/kapalı yönetimi ve abone listesi." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3 p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <DocH2>Hızlı Başlangıç</DocH2>
      <DocStep number={1} title="Sayfa Modeli Oluşturun">
        Sol menüden <strong>Sayfa Modelleri</strong>'ne gidin ve sitenizin içerik yapısını tanımlayın.
      </DocStep>
      <DocStep number={2} title="İçerik Girin">
        <strong>İçerik</strong> menüsünden modeli seçerek sayfanızı doldurun. Çoklu dil desteği otomatik aktiftir.
      </DocStep>
      <DocStep number={3} title="Yayınlayın">
        Taslak olarak kaydedip hazır olduğunuzda <DocCode>Yayınla</DocCode> butonuna tıklayın.
      </DocStep>
      <DocStep number={4} title="Public API'den Tüketin">
        Frontend uygulamanız <DocCode>/api/public/pages/{"{modelKey}/{slug}"}</DocCode> endpoint'inden içeriği çeker.
      </DocStep>
    </div>
  );
}

function SectionPageModels() {
  return (
    <div>
      <DocH1>Sayfa Modeli Oluşturma</DocH1>
      <DocLead>Sayfa modeli, bir sayfa tipinin şemasını tanımlar. Kod yazmadan, panelden oluşturulur.</DocLead>

      <DocH2>Adım Adım</DocH2>
      <DocStep number={1} title="Sayfa Modelleri sayfasına gidin">
        Sol menüden <strong>Sayfa Modelleri</strong>'ni seçin.
      </DocStep>
      <DocStep number={2} title="Yeni Model butonuna tıklayın">
        Sağ üstteki <DocCode>+ Yeni Model</DocCode> butonuna tıklayın.
      </DocStep>
      <DocStep number={3} title="Temel bilgileri doldurun">
        Ad, Key, açıklama ve ikon girin.
      </DocStep>
      <DocStep number={4} title="Schema JSON tanımlayın">
        Section ve field yapısını JSON olarak girin (aşağıdaki örneğe bakın).
      </DocStep>

      <DocTable
        headers={["Alan", "Örnek", "Açıklama"]}
        rows={[
          ["Ad", "Blog Yazısı", "Modelin okunabilir adı"],
          ["Key", "blog-post", "URL-friendly, küçük harf, tire ile ayrılmış"],
          ["Singleton", "✓ işaretli", "İşaretlenirse yalnızca 1 içerik oluşturulabilir"],
          ["İkon", "FileText", "Lucide ikon adı (PascalCase)"],
        ]}
      />

      <DocH2>Desteklenen Field Tipleri</DocH2>
      <DocTable
        headers={["Tip", "Kullanım", "Panel Bileşeni"]}
        rows={[
          [<DocCode>text</DocCode>, "Tek satır metin", "Input"],
          [<DocCode>textarea</DocCode>, "Çok satır metin", "Textarea"],
          [<DocCode>richtext</DocCode>, "Zengin metin", "TipTap Editör"],
          [<DocCode>asset</DocCode>, "Görsel / Belge / Video", "Medya Picker Modal"],
          [<DocCode>boolean</DocCode>, "Açık/Kapalı", "Toggle Switch"],
          [<DocCode>select</DocCode>, "Sabit seçenekler", "Dropdown"],
          [<DocCode>repeater</DocCode>, "Tekrarlanabilir alan grubu", "Sürükle-bırak liste"],
          [<DocCode>link</DocCode>, "URL + etiket + hedef", "Link Picker"],
          [<DocCode>icon</DocCode>, "Lucide ikon seçimi", "Icon Grid"],
          [<DocCode>date</DocCode>, "Tarih/Saat", "Date Picker"],
          [<DocCode>number</DocCode>, "Sayı", "Sayı Input"],
        ]}
      />

      <DocH2>Schema JSON Örneği</DocH2>
      <DocCodeBlock>{`{
  "sections": [
    {
      "key": "hero",
      "label": "Hero Alanı",
      "repeatable": false,
      "fields": [
        { "key": "title", "type": "text", "label": "Başlık", "translatable": true, "required": true },
        { "key": "image", "type": "asset", "label": "Görsel", "assetType": "image" },
        { "key": "cta",   "type": "link",  "label": "Buton" }
      ]
    },
    {
      "key": "features",
      "label": "Özellikler",
      "repeatable": true,
      "maxItems": 12,
      "fields": [
        { "key": "icon",  "type": "icon",     "label": "İkon" },
        { "key": "title", "type": "text",     "label": "Başlık", "translatable": true },
        { "key": "text",  "type": "richtext", "label": "Metin",  "translatable": true }
      ]
    }
  ]
}`}</DocCodeBlock>

      <DocTip>
        <DocCode>translatable: true</DocCode> işaretlenen field'lar, içerik editöründe her dil için ayrı tab gösterir.
      </DocTip>
    </div>
  );
}

function SectionContent() {
  return (
    <div>
      <DocH1>İçerik Yönetimi</DocH1>
      <DocLead>Sayfa modellerinden oluşturulan içerikler burada yönetilir.</DocLead>

      <DocH2>Yeni İçerik Oluşturma</DocH2>
      <DocStep number={1} title="İçerik sayfasına gidin">Sol menüden <strong>İçerik</strong>'i seçin.</DocStep>
      <DocStep number={2} title="Model seçin"><DocCode>+ Yeni İçerik</DocCode> butonuna tıklayıp model seçin.</DocStep>
      <DocStep number={3} title="Slug girin">URL'de kullanılacak slug'ı girin (örn. <DocCode>hakkimizda</DocCode>).</DocStep>
      <DocStep number={4} title="İçeriği doldurun">Translatable field'lar için dil tab'larını kullanın.</DocStep>
      <DocStep number={5} title="Kaydedin veya yayınlayın">Taslak kaydedip sonra yayınlayabilirsiniz.</DocStep>

      <DocH2>İçerik Durumları</DocH2>
      <div className="flex flex-wrap gap-2 my-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
          <DocBadge color="gray">Taslak</DocBadge>
          <span className="text-muted-foreground text-xs">Sadece editörler görebilir, Public API'de görünmez</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
          <DocBadge color="green">Yayında</DocBadge>
          <span className="text-muted-foreground text-xs">Public API üzerinden erişilebilir</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm">
          <DocBadge color="orange">Arşiv</DocBadge>
          <span className="text-muted-foreground text-xs">Yayından alınmış, silinmemiş</span>
        </div>
      </div>

      <DocTip>
        Listedeki <strong>CSV / Excel</strong> butonlarıyla filtrelenmiş içerikleri dışa aktarabilirsiniz.
      </DocTip>

      <DocH2>Sayfa Önizleme</DocH2>
      <DocP>
        İçerik düzenlerken sağ üstte <DocCode>Önizle</DocCode> butonu belirir. Bu butona tıklandığında <strong>Ayarlar → Genel</strong> sekmesinde tanımlı <DocCode>Site URL</DocCode> baz alınarak sayfanız yeni sekmede açılır.
      </DocP>
      <DocStep number={1} title="Site URL'sini ayarlayın">Ayarlar → Genel sekmesindeki <DocCode>Site URL</DocCode> alanına sitenizin adresini girin (örn. <DocCode>https://www.sirket.com</DocCode>).</DocStep>
      <DocStep number={2} title="İçeriği açın">Herhangi bir içerik düzenleme sayfasında Önizle butonuna tıklayın.</DocStep>

      <DocH2>Durum Geçişleri</DocH2>
      <DocTable
        headers={["Kaynak", "Hedef", "Nasıl"]}
        rows={[
          ["Taslak", "Yayında", "Liste ekranında yeşil ✓ ikonuna tıklayın (pages.publish yetkisi gerekir)"],
          ["Yayında", "Arşiv", "Liste ekranında arşiv ikonuna tıklayın"],
          ["Arşiv", "Taslak", "Düzenle ekranından durum değiştirin"],
        ]}
      />
    </div>
  );
}

function SectionMedia() {
  return (
    <div>
      <DocH1>Medya Kütüphanesi</DocH1>
      <DocLead>Tüm dosyalar (resim, PDF, video vb.) tek merkezden yönetilir.</DocLead>

      <DocH2>Dosya Yükleme</DocH2>
      <DocStep number={1} title="Medya sayfasına gidin">Sol menüden <strong>Medya</strong>'yı seçin.</DocStep>
      <DocStep number={2} title="Dosyayı yükleyin">Sağ üstteki <DocCode>Dosya Yükle</DocCode> butonuna tıklayın ya da dosyaları doğrudan sayfaya <strong>sürükleyip bırakın</strong> — birden fazla dosya aynı anda yüklenebilir.</DocStep>
      <DocStep number={3} title="Otomatik sınıflandırma">Dosya türüne (resim/belge/video) göre otomatik klasörlenir, resimler için küçük önizleme (thumbnail) oluşturulur.</DocStep>

      <DocTip>
        Medya sayfasına dosya sürükleyip bıraktığınızda mavi bir bırakma alanı belirir. Birden fazla dosyayı aynı anda bırakabilirsiniz.
      </DocTip>

      <DocH2>Depolama Yapısı</DocH2>
      <DocCodeBlock>{`wwwroot/uploads/
├── images/     → Resimler (JPEG, PNG, WebP, GIF, SVG)
│   └── 2026/06/{guid}-dosya.jpg
├── documents/  → Belgeler (PDF, Word, Excel)
├── videos/     → Videolar (MP4, WebM)
└── other/      → Diğer`}</DocCodeBlock>

      <DocH2>Dosya Limitleri</DocH2>
      <DocTable
        headers={["Tür", "Maksimum Boyut"]}
        rows={[
          ["Resim", "5 MB"],
          ["Belge", "20 MB"],
          ["Video", "100 MB"],
        ]}
      />

      <DocH2>Özellikler</DocH2>
      <div className="space-y-2 my-4">
        {[
          { icon: CheckCircle, text: "Resimler için otomatik thumbnail oluşturulur" },
          { icon: CheckCircle, text: "Alt text (erişilebilirlik) her dil için ayrı girilebilir" },
          { icon: CheckCircle, text: "FileType filtresi ile sadece resim/belge/video görüntülenebilir" },
          { icon: CheckCircle, text: "İçerik formlarındaki asset field'larında doğrudan seçilebilir" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-2.5">
            <Icon size={15} className="text-green-500 mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionRoles() {
  return (
    <div>
      <DocH1>Rol & Yetki Yönetimi</DocH1>
      <DocLead>Dinamik rol sistemi — yöneticiler kendi rollerini panelden oluşturur, kod değişikliği gerekmez.</DocLead>

      <DocH2>Rol Oluşturma</DocH2>
      <DocStep number={1} title="Roller & Yetkiler sayfasına gidin"><DocCode>roles.manage</DocCode> yetkisi gerekir.</DocStep>
      <DocStep number={2} title="Yeni Rol butonuna tıklayın">Rol adı ve açıklama girin.</DocStep>
      <DocStep number={3} title="Yetki Matrisi'ni doldurun">Modül bazlı yetkileri checkbox ile seçin.</DocStep>
      <DocStep number={4} title="Kaydedin">Kullanıcılara bu rolü atayabilirsiniz.</DocStep>

      <DocH2>Yetki Listesi</DocH2>
      <DocTable
        headers={["Modül", "Yetkiler"]}
        rows={[
          ["Pages", "view · create · edit · delete · publish"],
          ["PageModels", "view · create · edit · delete"],
          ["Media", "view · upload · delete"],
          ["Menus", "manage"],
          ["Settings", "general.edit · seo.edit · smtp.edit · localization.edit · languages.manage"],
          ["Users", "manage"],
          ["Roles", "manage"],
          ["Dashboard", "view"],
          ["Activity", "view"],
        ]}
      />

      <DocWarning>
        <strong>SuperAdmin</strong> sistem rolüdür — silinemez, yetkileri değiştirilemez. Tüm yetkilere otomatik sahiptir.
      </DocWarning>

      <DocH2>Kullanıcıya Rol Atama</DocH2>
      <DocStep number={1} title="Kullanıcılar sayfasına gidin">Sol menüden <strong>Kullanıcılar</strong>'ı seçin.</DocStep>
      <DocStep number={2} title="Rol Ata ikonuna tıklayın">Kullanıcı satırındaki 👤 ikonuna tıklayın.</DocStep>
      <DocStep number={3} title="Rolleri seçin">Birden fazla rol seçilebilir — yetkiler birleştirilir.</DocStep>
      <DocStep number={4} title="Kaydedin">Değişiklikler sonraki girişte geçerli olur.</DocStep>

      <DocInfo>
        JWT token'ına kullanıcının tüm permission key'leri claim olarak gömülür. Rol değişikliği sonraki giriş/token yenileme sonrası aktif olur.
      </DocInfo>
    </div>
  );
}

function SectionSettings() {
  return (
    <div>
      <DocH1>Sistem Ayarları</DocH1>
      <DocLead>Sol menüden Ayarlar'a girerek 5 farklı sekmeyi yapılandırabilirsiniz.</DocLead>

      <DocTable
        headers={["Sekme", "İçerik"]}
        rows={[
          ["Genel", "Site adı, logo, favicon, iletişim bilgileri, Site URL, abonelik sistemi açma/kapama, iletişim formu otomatik yanıt"],
          ["SEO", "Title şablonu, meta description, OG image, Google Analytics / GTM ID"],
          ["SMTP", "E-posta sunucusu yapılandırması — şifre şifreli saklanır"],
          ["Yerelleştirme", "Varsayılan dil, tarih formatı, zaman dilimi"],
          ["Tema", "Ana renk ve font"],
        ]}
      />

      <DocH2>Genel Sekmesi — Özel Alanlar</DocH2>
      <DocTable
        headers={["Alan", "Açıklama"]}
        rows={[
          ["Site URL", "Frontend sitenizin tam adresi (örn. https://www.sirket.com). İçerik editöründeki Önizle butonu bu URL'yi kullanır."],
          ["Abonelik Sistemi", "Kapatılırsa yeni abonelik kaydı engellenir (503). Mevcut aboneler silinmez."],
          ["İletişim Formu Otomatik Yanıt", "Açıkken, iletişim formu doldurulduğunda gönderene otomatik bir teşekkür maili gider."],
        ]}
      />

      <DocH2>SMTP Şifre Güvenliği</DocH2>
      <DocInfo>
        SMTP şifresi AES-256 ile şifrelenip veritabanında saklanır. Panelde her zaman <DocCode>••••••</DocCode> olarak görünür.
        Değiştirmek istemiyorsanız alanı boş bırakın — mevcut şifre korunur.
      </DocInfo>

      <DocH2>Dil Ekleme</DocH2>
      <DocStep number={1} title="Ayarlar → Diller sayfasına gidin" />
      <DocStep number={2} title="Dil Ekle butonuna tıklayın">Dil kodu (örn. <DocCode>en</DocCode>), ad ve bayrak emoji girin.</DocStep>
      <DocStep number={3} title="Kaydedin">Yeni dil, içerik formlarında otomatik tab olarak görünür.</DocStep>
    </div>
  );
}

function SectionMenus() {
  return (
    <div>
      <DocH1>Menü Yönetimi</DocH1>
      <DocLead>4 ayrı menü bağımsız olarak yönetilir; masaüstü ve mobil için farklı yapılar tanımlanabilir.</DocLead>

      <DocTable
        headers={["Menü Anahtarı", "Kullanım Yeri"]}
        rows={[
          ["navbar-desktop", "Masaüstü üst navigasyon"],
          ["navbar-mobile",  "Mobil hamburger menü"],
          ["footer-desktop", "Masaüstü footer"],
          ["footer-mobile",  "Mobil footer"],
        ]}
      />

      <DocH2>Menü Öğesi Özellikleri</DocH2>
      <DocTable
        headers={["Alan", "Açıklama"]}
        rows={[
          ["Etiket", "Her dilde ayrı metin (TR / EN vb.)"],
          ["Link Tipi", "page (dahili slug) · external (URL) · category"],
          ["Hedef", "Slug veya tam URL"],
          ["İkon", "Lucide ikon adı (opsiyonel)"],
          ["Yeni Sekme", "_blank olarak açılır mı?"],
          ["Alt Öğeler", "İç içe hiyerarşi — sürükle-bırak ile sıralama"],
        ]}
      />

      <DocTip>
        Öğeleri <strong>açıp kapatarak</strong> düzenleyebilir, <strong>Alt Öğeler</strong> ekleyerek dropdown menü oluşturabilirsiniz.
        Değişiklikler <strong>Kaydet</strong> butonuna basılana kadar uygulanmaz.
      </DocTip>
    </div>
  );
}

function SectionContact() {
  return (
    <div>
      <DocH1>İletişim & Mail</DocH1>
      <DocLead>
        Sitenizin iletişim formundan gelen mesajları yönetin, tek tek veya tüm abonelere toplu mail gönderin,
        tekrar kullanılabilir mail şablonları oluşturun.
      </DocLead>

      <DocH2>İletişim Mesajları</DocH2>
      <DocP>
        Sol menüdeki <strong>İletişim</strong> sayfasında ziyaretçilerin iletişim formundan gönderdiği mesajları görürsünüz.
        Okunmamış mesajlar kalın yazıyla işaretlidir.
      </DocP>
      <DocStep number={1} title="Mesajı açın">Listeden bir mesaja tıklayın — sağ panelde içerik görünür, mesaj otomatik okundu olarak işaretlenir.</DocStep>
      <DocStep number={2} title="Yanıtlayın"><DocCode>Yanıtla</DocCode> butonuna tıklayarak direkt o kişiye mail gönderin.</DocStep>
      <DocStep number={3} title="Silin">İşi biten mesajları çöp kutusu ikonuyla kaldırın.</DocStep>

      <DocH2>Otomatik Yanıt</DocH2>
      <DocP>
        İletişim formu doldurulduğunda ziyaretçiye otomatik bir teşekkür maili gönderilebilir.
      </DocP>
      <DocStep number={1} title="Ayarlar → Genel sekmesine gidin" />
      <DocStep number={2} title="İletişim Formu Otomatik Yanıt toggle'ını açın">Konu ve HTML içeriği alanları belirir.</DocStep>
      <DocStep number={3} title="Konu ve içeriği doldurun">HTML formatında bir yanıt metni yazabilirsiniz.</DocStep>
      <DocStep number={4} title="Kaydedin">Bundan sonra gelen her iletişim formuna otomatik yanıt gider.</DocStep>

      <DocWarning>
        Otomatik yanıt gönderilebilmesi için <strong>Ayarlar → SMTP</strong> sekmesinin doğru yapılandırılmış olması gerekir.
      </DocWarning>

      <DocH2>Mail Gönder</DocH2>
      <DocP>
        Sol menüdeki <strong>Mail Gönder</strong> sayfasından belirli kişilere ya da tüm aktif abonelere mail gönderebilirsiniz.
      </DocP>
      <DocTable
        headers={["Özellik", "Açıklama"]}
        rows={[
          ["Çoklu alıcı", "Alıcı satırı ekleyip birden fazla kişiye aynı anda gönderin"],
          ["Şablon Yükle", "Kayıtlı şablonlardan birini seçerek konu ve içeriği otomatik doldurun"],
          ["Tüm Abonelere", "Aktif abonelerin tamamına toplu mail gönderir — onay istenir"],
          ["TipTap editör", "Kalın, başlık, liste gibi zengin metin biçimlendirmeleri desteklenir"],
          ["Gönderim geçmişi", "Oturum içinde gönderilen maillerin özeti sayfanın altında görünür"],
        ]}
      />

      <DocH2>Mail Şablonları</DocH2>
      <DocP>
        Sık kullandığınız konu + içerik kombinasyonlarını şablon olarak kaydedin. Sol menüdeki <strong>Mail Şablonları</strong> sayfasından yönetilir.
      </DocP>
      <DocStep number={1} title="Mail Şablonları sayfasına gidin">Sol menüden İletişim grubu altındaki <strong>Mail Şablonları</strong>'nı seçin.</DocStep>
      <DocStep number={2} title="Yeni Şablon oluşturun">Ad, konu ve HTML içeriği girin.</DocStep>
      <DocStep number={3} title="Mail Gönder sayfasında kullanın"><DocCode>Şablon Yükle</DocCode> butonuna tıklayıp şablonu seçin — konu ve içerik otomatik dolar.</DocStep>
    </div>
  );
}

function SectionSubscribers() {
  return (
    <div>
      <DocH1>Aboneler</DocH1>
      <DocLead>
        Sitenizin abonelik formunu dolduran kişilerin listesi burada tutulur.
        Abonelik sistemi açık/kapalı olarak yönetilebilir.
      </DocLead>

      <DocH2>Abonelik Sistemi Ayarı</DocH2>
      <DocStep number={1} title="Ayarlar → Genel sekmesine gidin" />
      <DocStep number={2} title="Abonelik Sistemi toggle'ını açın veya kapatın">
        Kapalıyken <DocCode>POST /api/public/subscribe</DocCode> endpoint'i <DocCode>503</DocCode> döner,
        yeni abonelik kaydı yapılamaz.
      </DocStep>

      <DocTip>
        Abonelik kapalıyken mevcut aboneler silinmez; sadece yeni kayıt engellenir.
      </DocTip>

      <DocH2>Abone Listesi</DocH2>
      <DocP>
        Sol menüden <strong>Aboneler</strong>'e gidin. Aktif / İptal / Tümü filtreleriyle listeyi daraltabilirsiniz.
      </DocP>
      <DocTable
        headers={["Sütun", "Açıklama"]}
        rows={[
          ["E-posta", "Abonenin e-posta adresi"],
          ["Ad", "Opsiyonel — formda isim girilmişse"],
          ["Durum", "Aktif (yeşil) / İptal (gri)"],
          ["Kayıt Tarihi", "Aboneliğin oluşturulduğu tarih"],
        ]}
      />

      <DocH2>Toplu Mail Gönderimi</DocH2>
      <DocP>
        <strong>Mail Gönder</strong> sayfasındaki <DocCode>Tüm Abonelere</DocCode> butonu,
        durumu <em>Aktif</em> olan tüm abonelere aynı maili gönderir.
        Gönderim başlamadan önce onay kutusu çıkar.
      </DocP>

      <DocH2>Abonelik Kaldırma (Unsubscribe)</DocH2>
      <DocP>
        Ziyaretçiler <DocCode>POST /api/public/unsubscribe</DocCode> endpoint'ini çağırarak
        aboneliklerini iptal edebilir. Panel üzerinden de abone kaydını silebilirsiniz.
      </DocP>

      <DocH2>Public API Endpoint'leri</DocH2>
      <DocCodeBlock>{`POST /api/public/subscribe
Body: { "email": "...", "fullName": "..." }
→ Abonelik oluşturur (sistem kapalıysa 503 döner)

POST /api/public/unsubscribe
Body: { "email": "..." }
→ Aboneliği iptal eder`}</DocCodeBlock>
    </div>
  );
}

function SectionApi() {
  return (
    <div>
      <DocH1>Public API</DocH1>
      <DocLead>Frontend uygulamanız bu endpoint'ler üzerinden CMS içeriğini tüketir. Authentication gerekmez, 5 dakika cache'lenir.</DocLead>

      <DocH2>Endpoint'ler</DocH2>
      <DocCodeBlock>{`GET /api/public/pages/{modelKey}/{slug}?lang=tr
    → Tek sayfa içeriği (her istek ViewCount'u artırır)

GET /api/public/pages/{modelKey}?lang=tr&page=1&pageSize=10
    → Yayındaki sayfa listesi (blog index vb.)

GET /api/public/menus/{key}?lang=tr
    → Menü ağacı (navbar-desktop, footer-mobile vb.)

GET /api/public/settings?lang=tr
    → Genel ayarlar, SEO defaults, sosyal linkler, tema

GET /api/public/languages
    → Aktif diller listesi`}</DocCodeBlock>

      <DocH2>Örnek İstek & Yanıt</DocH2>
      <DocCodeBlock>{`// İstek
fetch("/api/public/pages/blog-post/yapay-zeka-nedir?lang=tr")

// Yanıt
{
  "id": "3fa85f64-...",
  "modelKey": "blog-post",
  "slug": "yapay-zeka-nedir",
  "contentJson": {
    "tr": {
      "hero": { "title": "Yapay Zeka Nedir?", "image": { "url": "/uploads/..." } }
    }
  },
  "seoMetaJson": {
    "tr": { "title": "Yapay Zeka Nedir? | Blog", "description": "..." }
  },
  "viewCount": 142,
  "publishedAt": "2026-06-13T10:00:00Z"
}`}</DocCodeBlock>

      <DocInfo>
        Public endpoint'ler <strong>5 dakika output cache</strong> ile korunur. Yeni içerik yayınladıktan sonra
        en fazla 5 dakika içinde görünür olur.
      </DocInfo>

      <DocH2>Admin API</DocH2>
      <DocTable
        headers={["Prefix", "Kimlik Doğrulama", "Açıklama"]}
        rows={[
          ["/api/admin/*", "JWT Bearer token zorunlu", "Panel operasyonları (CRUD, upload, ayarlar)"],
          ["/api/public/*", "Gerekmez", "Frontend tüketimi için read-only"],
          ["/api/auth/*", "Gerekmez", "Login, refresh token, logout"],
        ]}
      />
    </div>
  );
}

const CONTENT_MAP = {
  "overview":    <SectionOverview />,
  "page-models": <SectionPageModels />,
  "content":     <SectionContent />,
  "media":       <SectionMedia />,
  "roles":       <SectionRoles />,
  "settings":    <SectionSettings />,
  "menus":       <SectionMenus />,
  "contact":     <SectionContact />,
  "subscribers": <SectionSubscribers />,
  "api":         <SectionApi />,
};

/* ─── Main page ─── */
export default function DocsPage() {
  const [active, setActive] = useState("overview");

  return (
    <>
      <PanelHelmet title="Dokümantasyon" />

      <div className="flex gap-6 min-h-[calc(100vh-8rem)]">
        {/* Sidebar nav */}
        <nav className="w-56 shrink-0">
          <div className="sticky top-0 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-3">
              Konular
            </p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  "w-full flex items-center gap-2.5 text-left px-3 py-2 rounded-lg text-sm transition-all",
                  active === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon size={15} className={active === id ? "text-primary" : "opacity-60"} />
                {label}
                {active === id && <ChevronRight size={12} className="ml-auto text-primary/60" />}
              </button>
            ))}
          </div>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0 rounded-2xl border bg-card p-8">
          {CONTENT_MAP[active]}
        </div>
      </div>
    </>
  );
}
