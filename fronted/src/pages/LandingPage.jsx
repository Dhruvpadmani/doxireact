import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Stethoscope, 
  Calendar, 
  Users, 
  Shield, 
  Clock, 
  MessageCircle, 
  Bot, 
  FileText, 
  Star, 
  Heart,
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Easy Appointment Booking",
      description: "Book appointments with doctors instantly with our user-friendly interface"
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Verified Doctors",
      description: "Connect with certified and experienced medical professionals"
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
      title: "Real-time Chat",
      description: "Communicate with doctors through secure messaging system"
    },
    {
      icon: <Bot className="h-8 w-8 text-orange-600" />,
      title: "AI Medical Assistant",
      description: "Get instant medical guidance and symptom analysis"
    },
    {
      icon: <FileText className="h-8 w-8 text-red-600" />,
      title: "Digital Prescriptions",
      description: "Receive and manage prescriptions digitally"
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-600" />,
      title: "Secure & Private",
      description: "Your medical data is protected with advanced security"
    }
  ]

  const stats = [
    { number: "10,000+", label: "Happy Patients" },
    { number: "500+", label: "Verified Doctors" },
    { number: "50,000+", label: "Successful Appointments" },
    { number: "99.9%", label: "Uptime" }
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Patient",
      content: "DOXI made it so easy to book appointments. The AI assistant helped me understand my symptoms better.",
      rating: 5
    },
    {
      name: "Dr. Rajesh Kumar",
      role: "Cardiologist",
      content: "Excellent platform for managing patients. The digital prescription system saves so much time.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Patient",
      content: "The real-time chat feature is amazing. I can get quick medical advice without visiting the clinic.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">DOXI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Features</a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">About</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Testimonials</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">Contact</a>
              
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Features</a>
              <a href="#about" className="block px-3 py-2 text-gray-700 dark:text-gray-300">About</a>
              <a href="#testimonials" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Testimonials</a>
              <a href="#contact" className="block px-3 py-2 text-gray-700 dark:text-gray-300">Contact</a>
              <Link
                to="/login"
                className="block px-3 py-2 bg-blue-600 text-white rounded-lg mx-3 text-center"
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Health, Our
              <span className="text-blue-600"> Priority</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              DOXI is India's leading online medical platform connecting patients with verified doctors. 
              Book appointments, get prescriptions, and access AI-powered medical assistance - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/patient-dashboard"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Patient Panel
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/doctor-appointments"
                className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Doctor Panel
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Login
              </Link>
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
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose DOXI?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide comprehensive healthcare solutions that make medical care accessible, convenient, and reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
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

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How DOXI Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Simple steps to get the medical care you need
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Sign Up & Login
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your account as a patient, doctor, or admin and access your personalized dashboard.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Book Appointment
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse verified doctors, check availability, and book appointments that fit your schedule.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Get Treatment
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Consult with doctors, receive prescriptions, and get follow-up care through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real feedback from patients and doctors using DOXI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and doctors who trust DOXI for their medical needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/patient-dashboard"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Patient Panel
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/doctor-appointments"
              className="bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center"
            >
              Doctor Panel
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">DOXI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing healthcare through technology, making medical care accessible to everyone.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-white">Testimonials</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Online Consultations</li>
                <li className="text-gray-400">Appointment Booking</li>
                <li className="text-gray-400">Digital Prescriptions</li>
                <li className="text-gray-400">AI Medical Assistant</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span className="text-gray-400">+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="text-gray-400">support@doxi.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-gray-400">Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 DOXI. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
