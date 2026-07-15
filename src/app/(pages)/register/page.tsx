"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Define the registration steps
  const steps = [
    {
      title: "Bem-vindo ao Mock Mentor!",
      subtitle: "Vamos começar seu cadastro",
      fields: ["email"]
    },
    {
      title: "Seus dados pessoais",
      subtitle: "Informe seus dados para continuar",
      fields: ["name", "phone"]
    },
    {
      title: "Sua especialidade",
      subtitle: "Qual sua área de atuação?",
      fields: ["role"]
    },
    {
      title: "Criar senha",
      subtitle: "Defina sua senha de acesso",
      fields: ["password", "confirmPassword"]
    }
  ];

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    switch (currentStep) {
      case 0:
        if (!userData.email) {
          newErrors.email = "Email é obrigatório";
        } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
          newErrors.email = "Email inválido";
        }
        break;
      case 1:
        if (!userData.name) {
          newErrors.name = "Nome é obrigatório";
        }
        if (!userData.phone) {
          newErrors.phone = "Telefone é obrigatório";
        }
        break;
      case 2:
        if (!userData.role) {
          newErrors.role = "Selecione uma área de atuação";
        }
        break;
      case 3:
        if (!userData.password) {
          newErrors.password = "Senha é obrigatória";
        } else if (userData.password.length < 6) {
          newErrors.password = "Senha deve ter pelo menos 6 caracteres";
        }
        if (userData.password !== userData.confirmPassword) {
          newErrors.confirmPassword = "Senhas não coincidem";
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (simulating JSON file)
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser = { ...userData, id: Date.now().toString() };
      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      // Redirect to login after successful registration
      router.push('/login');
    } catch (error) {
      console.error("Registration error:", error);
      alert("Erro ao registrar usuário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get current step data
  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Registration card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 transform">
          <div className="text-center mb-6">
            <h1 className="font-headline-lg text-primary font-bold text-2xl mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-on-surface-variant">{currentStepData.subtitle}</p>
          </div>

          {/* Slide transition container */}
          <div className="relative h-64 overflow-hidden">
            <div 
              className={`absolute inset-0 flex flex-col gap-4 transition-transform duration-500 ease-in-out ${
                currentStep === 0 ? 'translate-x-0' : 
                currentStep === 1 ? '-translate-x-full' : 
                currentStep === 2 ? '-translate-x-full' : 
                '-translate-x-full'
              }`}
            >
              {/* Step 1: Email */}
              {currentStep === 0 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        mail
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleInputChange}
                        className={`pl-10 pr-4 py-3 bg-surface-container-low border ${
                          errors.email ? 'border-red-500' : 'border-outline-variant/60'
                        } rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full text-label-md transition-all outline-none`}
                        placeholder="Digite seu email"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-label-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Info */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-2">
                      Nome completo
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        person
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleInputChange}
                        className={`pl-10 pr-4 py-3 bg-surface-container-low border ${
                          errors.name ? 'border-red-500' : 'border-outline-variant/60'
                        } rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full text-label-md transition-all outline-none`}
                        placeholder="Digite seu nome"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-label-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        phone
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        value={userData.phone}
                        onChange={handleInputChange}
                        className={`pl-10 pr-4 py-3 bg-surface-container-low border ${
                          errors.phone ? 'border-red-500' : 'border-outline-variant/60'
                        } rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full text-label-md transition-all outline-none`}
                        placeholder="Digite seu telefone"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-label-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Role */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-2">
                      Área de atuação
                    </label>
                    <select
                      name="role"
                      value={userData.role}
                      onChange={handleInputChange}
                      className={`px-4 py-3 bg-surface-container-low border ${
                        errors.role ? 'border-red-500' : 'border-outline-variant/60'
                      } rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full text-label-md transition-all outline-none appearance-none`}
                    >
                      <option value="">Selecione sua área</option>
                      <option value="backend">Backend Developer</option>
                      <option value="frontend">Frontend Developer</option>
                      <option value="fullstack">Full Stack Developer</option>
                      <option value="ai">AI Engineer</option>
                      <option value="cloud">Cloud Architect</option>
                      <option value="designer">UI/UX Designer</option>
                      <option value="product">Product Manager</option>
                      <option value="qa">QA Engineer</option>
                      <option value="security">Security Specialist</option>
                      <option value="legal">Especialista em Direito</option>
                    </select>
                    {errors.role && (
                      <p className="text-red-500 text-label-sm mt-1">{errors.role}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Password */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        lock
                      </span>
                      <input
                        type="password"
                        name="password"
                        value={userData.password}
                        onChange={handleInputChange}
                        className={`pl-10 pr-4 py-3 bg-surface-container-low border ${
                          errors.password ? 'border-red-500' : 'border-outline-variant/60'
                        } rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full text-label-md transition-all outline-none`}
                        placeholder="Digite sua senha"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-label-sm mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label-md font-bold text-on-surface mb-2">
                      Confirmar Senha
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                        lock
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={userData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-4 py-3 bg-surface-container-low border ${
                          errors.confirmPassword ? 'border-red-500' : 'border-outline-variant/60'
                        } rounded-xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full text-label-md transition-all outline-none`}
                        placeholder="Confirme sua senha"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-label-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-3 bg-surface-container-low border border-outline-variant/60 rounded-xl font-bold text-label-md text-on-surface hover:bg-surface-variant/50 transition-colors"
              >
                Voltar
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`flex-1 ml-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-label-md transition-all hover:from-orange-600 hover:to-red-600 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : currentStep === steps.length - 1 ? (
                "Finalizar Cadastro"
              ) : (
                "Continuar"
              )}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center mt-6">
            <p className="text-on-surface-variant text-label-md">
              Já tem uma conta?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-orange-500 font-bold hover:underline"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}