import React, { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, HelpCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { useNavigate } from 'react-router-dom';

// Add this interface above the component
interface ContactFormData {
  name?: string;
  email?: string;
  message?: string;
  category?: string;
}

interface ContactUsProps {
  backUrl: string;
}

const ContactUs: React.FC<ContactUsProps> = ({ backUrl }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Form data:", data);
      toast.success("Your message has been sent successfully!");
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // FAQ data
  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "To enroll in a course, browse our course catalog, select the course you're interested in, and click the 'Enroll' button. You'll be guided through the payment process if it's a paid course, or you can start immediately if it's free."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. For some regions, we also offer mobile payment options like Apple Pay and Google Pay."
    },
    {
      question: "How do I get a certificate after completing a course?",
      answer: "Certificates are automatically generated once you complete all required modules and assessments of a course. You can download your certificate from your dashboard under the 'Certificates' section."
    },
    {
      question: "Is there a mobile app available?",
      answer: "No, our E-learning platform is not currently available as a mobile app. However, we are actively developing mobile apps for both iOS and Android devices and look forward to launching them soon!"
    }
  ];

  // Support ticket categories
  const categories = [
    { id: "general", label: "General Inquiry" },
    { id: "technical", label: "Technical Support" },
    { id: "billing", label: "Billing & Payments" },
    { id: "content", label: "Course Content" },
    { id: "feedback", label: "Feedback & Suggestions" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add this button near the top of your component */}
      <button 
        onClick={() => navigate(backUrl)}
        className="absolute top-4 left-4 text-white hover:text-gray-200"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg max-w-2xl">
            We're here to help! Reach out to our team with any questions, feedback, or support needs you may have.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-purple-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <a href="mailto:javedfv8@gmail.com" className="text-purple-600 hover:underline">
                      javedfv8@gmail.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-purple-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <a href="tel:+11234567890" className="text-purple-600 hover:underline">
                      +1 (000) 000-0000
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-purple-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Office</p>
                    <address className="not-italic text-gray-600">
                      123 Learning Street<br />
                      Education City, EC 12345<br />
                      Calicut
                    </address>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-purple-600 mt-1 mr-3" />
                  <div>
                    <p className="font-medium text-gray-700">Hours</p>
                    <p className="text-gray-600">
                      Monday - Friday: 9AM - 6PM<br />
                      Saturday: 10AM - 4PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social Media Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Connect With Us</h2>
              <div className="flex space-x-4">
                <a href="#" className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="bg-blue-400 text-white p-3 rounded-full hover:bg-blue-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Send Us a Message</h2>
              
              {/* Category Tabs */}
              <div className="mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex space-x-2 min-w-max">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${activeTab === category.id
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      onClick={() => setActiveTab(category.id)}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 text-center bg-gray-50 rounded-lg">
                <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Contact Us Directly</h3>
                <p className="text-gray-600 mb-4">
                  Please email us at <a href="mailto:javedfv8@gmail.com" className="text-purple-600 hover:underline">javedfv8@gmail.com</a> or 
                  call us at <a href="#" className="text-purple-600 hover:underline">+1 (123) 456-7890</a> for assistance.
                </p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="mailto:javedfv8@gmail.com" 
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </a>
                  <a 
                    href="tel:+11234567890" 
                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us
                  </a>
                </div>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <HelpCircle className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <details className="group">
                      <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 bg-gray-50 hover:bg-gray-100">
                        <span>{faq.question}</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </span>
                      </summary>
                      <p className="p-4 text-gray-600">{faq.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-3">Didn't find what you're looking for?</p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Visit our Knowledge Base
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-purple-600 text-white py-12">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-semibold mb-2">Stay Updated</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive updates on new courses, promotions, and educational resources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;