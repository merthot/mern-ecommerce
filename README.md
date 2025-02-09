# MERN E-Commerce Projesi

Modern ve kullanıcı dostu bir e-ticaret web uygulaması.

## Özellikler

- Kullanıcı kaydı ve girişi
- Ürün listeleme ve detay sayfaları
- Kategorilere göre filtreleme
- Alışveriş sepeti yönetimi
- Favori ürünler
- İndirim yönetimi
- Admin paneli
- Responsive tasarım

## Teknolojiler

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Framer Motion
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Nodemailer

## Kurulum

1. Projeyi klonlayın
```bash
git clone https://github.com/merthot/mern-ecommerce.git
cd mern-ecommerce
```

2. Backend kurulumu
```bash
cd backend
cp .env.example .env  # .env dosyasını oluşturun ve gerekli değişkenleri ayarlayın
npm install
npm run dev
```

3. Frontend kurulumu
```bash
cd frontend
npm install
npm start
```

## Ortam Değişkenleri

Projeyi çalıştırmadan önce gerekli ortam değişkenlerini ayarlamanız gerekmektedir. Backend klasöründeki `.env.example` dosyasını `.env` olarak kopyalayın ve değerleri kendi yapılandırmanıza göre güncelleyin.

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın. 