import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Users, 
  Shield, 
  Globe, 
  ArrowRight, 
  CheckCircle,
  DollarSign,
  Briefcase,
  Eye,
  Star
} from 'lucide-react';
import LanguageToggle from '../components/common/LanguageToggle';
import ThemeToggle from '../components/common/ThemeToggle';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: i18n.language === 'nd' ? "Amathuba Otyalo-mali" : "Investment Opportunities",
      description: i18n.language === 'nd' ? "Thola futhi uxhase amabhizinisi athembisayo endaweni yakho" : "Discover and fund promising local businesses in your community"
    },
    {
      icon: <Users className="h-8 w-8 text-success-600" />,
      title: i18n.language === 'nd' ? "Okwenziwa Ngomphakathi" : "Community-Driven",
      description: i18n.language === 'nd' ? "Xhumana nosomabhizinisi labatyali-mali eZimbabwe" : "Connect with entrepreneurs and investors in Zimbabwe"
    },
    {
      icon: <Shield className="h-8 w-8 text-accent-600" />,
      title: i18n.language === 'nd' ? "Okuphephile Nokucacileyo" : "Secure & Transparent",
      description: i18n.language === 'nd' ? "Inkonzo ye-escrow eyakhelwe ngaphakathi lokulandelela amaphawu ukuze utyalo-mali luphepha" : "Built-in escrow services and milestone tracking for safe investments"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary-600" />,
      title: i18n.language === 'nd' ? "Ukugxila Kwendawo" : "Local Focus",
      description: i18n.language === 'nd' ? "Ukusekela ukukhula komnotho eBulawayo nakulo lonke iZimbabwe" : "Supporting economic growth in Bulawayo and across Zimbabwe"
    }
  ];

  const userTypes = [
    {
      icon: <Briefcase className="h-12 w-12 text-success-600" />,
      title: t('roles.entrepreneur'),
      description: i18n.language === 'nd' ? "Qoqa imali yemibono yakho yebhizinisi futhi uxhumane labatyali-mali" : "Raise funding for your business ideas and connect with investors",
      benefits: i18n.language === 'nd' ? [
        "Dala amathuba emali",
        "Landelela amaphawu lenqubekela",
        "Finyelela kunethiwekhi yabatyali-mali",
        "Abahlinzeki benkonzo abachwepheshe"
      ] : [
        "Create funding opportunities",
        "Track milestones and progress",
        "Access to investor network",
        "Professional service providers"
      ]
    },
    {
      icon: <DollarSign className="h-12 w-12 text-primary-600" />,
      title: t('roles.investor'),
      description: i18n.language === 'nd' ? "Thola amathuba otyalo-mali wakhe iphothifoliyo yakho" : "Discover investment opportunities and build your portfolio",
      benefits: i18n.language === 'nd' ? [
        "Dinga amathuba ahlolwe",
        "Joyina amaqembu otyalo-mali",
        "Landelela utyalo-mali lwakho",
        "Izincomo ezenziwa yi-AI"
      ] : [
        "Browse vetted opportunities",
        "Join investment pools",
        "Track your investments",
        "AI-powered recommendations"
      ]
    },
    {
      icon: <Users className="h-12 w-12 text-accent-600" />,
      title: t('roles.serviceProvider'),
      description: i18n.language === 'nd' ? "Nikela ngenkonzo zabachwepheshe kumabhizinisi akhulayo" : "Offer professional services to growing businesses",
      benefits: i18n.language === 'nd' ? [
        "Xhumana nosomabhizinisi",
        "Nikela ngenkonzo zobuchwepheshe",
        "Yakha udumo lwakho",
        "Ukucutshungulwa kokukhokha okuphephile"
      ] : [
        "Connect with entrepreneurs",
        "Provide expert services",
        "Build your reputation",
        "Secure payment processing"
      ]
    },
    {
      icon: <Eye className="h-12 w-12 text-gray-600" />,
      title: t('roles.observer'),
      description: i18n.language === 'nd' ? "Qasha futhi ubheke imisebenzi yotyalo-mali" : "Monitor and oversee investment activities",
      benefits: i18n.language === 'nd' ? [
        "Ukufinyelela kokufunda kuphela",
        "Qasha inqubekela",
        "Khiqiza imibiko",
        "Qinisekisa ukucaca"
      ] : [
        "Read-only access",
        "Monitor progress",
        "Generate reports",
        "Ensure transparency"
      ]
    }
  ];

  const stats = [
    { 
      number: "500+", 
      label: i18n.language === 'nd' ? "Amalungu Omphakathi" : "Community Members" 
    },
    { 
      number: "$2M+", 
      label: i18n.language === 'nd' ? "Imali Eqoqiwe" : "Funds Raised" 
    },
    { 
      number: "150+", 
      label: i18n.language === 'nd' ? "Amaphrojekthi Aphumelelayo" : "Successful Projects" 
    },
    { 
      number: "95%", 
      label: i18n.language === 'nd' ? "Isilinganiso Sempumelelo" : "Success Rate" 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                Abathwa Capital
              </h1>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <ThemeToggle />
              <Link
                to="/login"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-lg transition-colors"
              >
                {t('auth.login')}
              </Link>
              <Link
                to="/signup"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('auth.register')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {i18n.language === 'nd' ? (
                <>
                  Ukuxhumanisa Osomabhizinisi
                  <span className="text-primary-600 dark:text-primary-400 block">
                    Labatyali-mali BaseZimbabwe
                  </span>
                </>
              ) : (
                <>
                  Connecting Zimbabwean
                  <span className="text-primary-600 dark:text-primary-400 block">
                    Entrepreneurs & Investors
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {t('common.tagline')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center text-lg font-medium"
              >
                {i18n.language === 'nd' ? 'Qala' : 'Get Started'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-lg font-medium">
                {i18n.language === 'nd' ? 'Funda Kabanzi' : 'Learn More'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {i18n.language === 'nd' ? 'Kungani Ukhetha Abathwa Capital?' : 'Why Choose Abathwa Capital?'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {i18n.language === 'nd' ? 
                'Iplatifomi yethu inikela ngakho konke okudingayo ukuze uphumelele kotyalo-mali olwenziwa ngomphakathi' :
                'Our platform provides everything you need for successful community-driven investments'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {i18n.language === 'nd' ? 'Joyina Umphakathi Wethu' : 'Join Our Community'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {i18n.language === 'nd' ? 
                'Noma ungusomabhizinisi, umtyali-mali, noma umhlinzeki wenkonzo, silendawo yakho' :
                'Whether you\'re an entrepreneur, investor, or service provider, we have a place for you'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {userTypes.map((userType, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-6">
                  {userType.icon}
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userType.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {userType.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {userType.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-5 w-5 text-success-600 mr-3 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {i18n.language === 'nd' ? 'Kunjani Ukusebenza' : 'How It Works'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {i18n.language === 'nd' ? 
                'Izinyathelo ezilula zokuqala uhambo lwakho lotyalo-mali' :
                'Simple steps to start your investment journey'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {i18n.language === 'nd' ? 'Zibhalise Futhi Uqinisekise' : 'Sign Up & Verify'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {i18n.language === 'nd' ? 
                  'Dala i-akhawunti yakho futhi uqede ukuqinisekiswa kwephrofayili yakho' :
                  'Create your account and complete your profile verification'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-success-100 dark:bg-success-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-success-600 dark:text-success-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {i18n.language === 'nd' ? 'Hlola Futhi Uxhumane' : 'Explore & Connect'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {i18n.language === 'nd' ? 
                  'Dinga amathuba noma udale umkhankaso wakho wemali' :
                  'Browse opportunities or create your funding campaign'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-accent-100 dark:bg-accent-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {i18n.language === 'nd' ? 'Tyala Imali Futhi Ukhule' : 'Invest & Grow'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {i18n.language === 'nd' ? 
                  'Yenza utyalo-mali oluphepha futhi ulandelele ukukhula kwephothifoliyo yakho' :
                  'Make secure investments and track your portfolio growth'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {i18n.language === 'nd' ? 'Okuthiwa Ngumphakathi Wethu' : 'What Our Community Says'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {i18n.language === 'nd' ? 
                  '"Abathwa Capital yangisiza ngokuqoqa imali yephrojekthi yami yezolimo. Iplatifomi ilula ukuyisebenzisa futhi umphakathi uyasekela kakhulu."' :
                  '"Abathwa Capital helped me raise funding for my agricultural project. The platform is easy to use and the community is very supportive."'
                }
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-primary-600 dark:text-primary-400 font-semibold">TM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Thabo Moyo</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('roles.entrepreneur')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {i18n.language === 'nd' ? 
                  '"Njengomtyali-mali, ngiyakuthanda ukucaca lezici zokuphepha. Ngiyakwazi ukulandelela utyalo-mali lwami futhi ngibone inqubekela yangempela kusomabhizinisi."' :
                  '"As an investor, I love the transparency and security features. I can track my investments and see real progress from entrepreneurs."'
                }
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-success-600 dark:text-success-400 font-semibold">PN</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Priscilla Ndlovu</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('roles.investor')}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {i18n.language === 'nd' ? 
                  '"Iplatifomi ingixhumanisa namabhizinisi adinga inkonzo zami zokweluleka. Bekumnandi kakhulu ukukhulisa umsebenzi wami."' :
                  '"The platform connects me with businesses that need my consulting services. It\'s been great for growing my practice."'
                }
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mr-3">
                  <span className="text-accent-600 dark:text-accent-400 font-semibold">SM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Sipho Mthembu</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('roles.serviceProvider')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {i18n.language === 'nd' ? 'Usukulungele Ukuqala Uhambo Lwakho?' : 'Ready to Start Your Journey?'}
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            {i18n.language === 'nd' ? 
              'Joyina amakhulu osomabhizinisi labatyali-mali abakha ikusasa lomnotho waseZimbabwe' :
              'Join thousands of entrepreneurs and investors building Zimbabwe\'s economic future'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center text-lg font-medium"
            >
              {i18n.language === 'nd' ? 'Joyina Manje' : 'Join Now'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary-600 transition-colors text-lg font-medium">
              {i18n.language === 'nd' ? 'Sithumele' : 'Contact Us'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary-400 mb-4">Abathwa Capital</h3>
              <p className="text-gray-300 mb-4">
                {t('common.tagline')}
              </p>
              <div className="text-sm text-gray-400">
                <p>📞 +263789989619</p>
                <p>📧 admin@abathwa.com</p>
                <p>💬 wa.me/789989619</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {i18n.language === 'nd' ? 'Iplatifomi' : 'Platform'}
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Kunjani Ukusebenza' : 'How It Works'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Ukuphepha' : 'Security'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Imali' : 'Fees'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {i18n.language === 'nd' ? 'Inkxaso' : 'Support'}
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Isikhungo Sosizo' : 'Help Center'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Sithumele' : 'Contact Us'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Umphakathi' : 'Community'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Isimo' : 'Status'}
                </a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">
                {i18n.language === 'nd' ? 'Ezomthetho' : 'Legal'}
              </h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {t('auth.privacyPolicy')}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {t('auth.termsOfService')}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Inqubomgomo Ye-Cookie' : 'Cookie Policy'}
                </a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">
                  {i18n.language === 'nd' ? 'Ukuthobela' : 'Compliance'}
                </a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Abathwa Capital. {i18n.language === 'nd' ? 'Wonke amalungelo agodliwe.' : 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;