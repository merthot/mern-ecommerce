import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    };

    return (
        <footer className="bg-white">

            {/* Orta Kısım - Linkler */}
            <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Kurumsal */}
                    <motion.div {...fadeIn} className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Kurumsal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Hakkımızda
                                </Link>
                            </li>
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Kariyer
                                </Link>
                            </li>
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Mağazalarımız
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Yardım */}
                    <motion.div {...fadeIn} className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Yardım</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Sıkça Sorulan Sorular
                                </Link>
                            </li>
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Kargo Takip
                                </Link>
                            </li>
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    İade Koşulları
                                </Link>
                            </li>
                            <li>
                                <Link className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Gizlilik Politikası
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Kategoriler */}
                    <motion.div {...fadeIn} className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Kategoriler</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/kadin/giyim/elbise" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Kadın
                                </Link>
                            </li>
                            <li>
                                <Link to="/erkek/giyim/gomlek" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Erkek
                                </Link>
                            </li>
                            <li>
                                <Link to="/cocuk/giyim/tisort" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Çocuk
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    {/* İletişim */}
                    <motion.div {...fadeIn} className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">İletişim</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2 text-gray-600">
                                <FaMapMarkerAlt className="h-5 w-5" />
                                <span>İstanbul, Türkiye</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-600">
                                <FaEnvelope className="h-5 w-5" />
                                <span>info@example.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-600">
                                <FaPhone className="h-5 w-5" />
                                <span>+90 123 456 7890</span>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Alt Kısım - Sosyal Medya ve Telif Hakkı */}
            <div className="border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <motion.div {...fadeIn} className="flex space-x-6">
                            <a href="" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="sr-only">Facebook</span>
                                <FaFacebook className="h-6 w-6" />
                            </a>
                            <a href="" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <FaInstagram className="h-6 w-6" />
                            </a>
                            <a href="" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <span className="sr-only">Twitter</span>
                                <FaTwitter className="h-6 w-6" />
                            </a>
                        </motion.div>
                        <motion.div {...fadeIn} className="text-gray-500 text-sm">
                            © 2025 Tüm hakları saklıdır.
                        </motion.div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 