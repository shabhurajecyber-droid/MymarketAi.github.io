import React, { useState, useRef, useEffect } from 'react';
import Scene3D from './components/Scene3D';
import AnalysisDisplay from './components/AnalysisDisplay';
import { analyzeChart } from './services/geminiService';
import { AnalysisResult, LoadingState } from './types';
import { Upload, Loader2, Sparkles, BarChart2, AlertTriangle, Camera, X, Aperture } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setIsCameraOpen(true);
      setCameraStream(stream);
      // Slight delay to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
      setResult(null);
      setPreview(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("कॅमेरा ॲक्सेस मिळू शकला नाही. कृपया ब्राउझर परमिशन तपासा. (Cannot access camera. Check permissions.)");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            processFile(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const processFile = async (file: File) => {
    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setResult(null);
    setLoading({ status: 'analyzing', message: 'विश्लेषण चालू आहे (Analyzing)...' });

    try {
      const analysis = await analyzeChart(file);
      setResult(analysis);
      setLoading({ status: 'success' });
    } catch (error) {
      console.error(error);
      setLoading({ status: 'error', message: 'Error analyzing chart. Please try again. (त्रुटी आली, पुन्हा प्रयत्न करा)' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadClick = () => {
    if (!isCameraOpen) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden">
      {/* 3D Background */}
      <Scene3D />

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center py-10 px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-md mb-4 border border-white/20 shadow-[0_0_30px_rgba(0,255,136,0.3)]">
            <BarChart2 className="w-8 h-8 text-green-400 mr-2" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-blue-400 to-purple-500">
              MY MARKET AI
            </h1>
          </div>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mt-2 font-light">
            तुमचा चार्ट अपलोड करा आणि AI कडून मराठी व इंग्रजीत विश्लेषण मिळवा.
            <br/>
            <span className="text-sm opacity-70">(Upload chart for Technical Analysis in Marathi & English)</span>
          </p>
        </header>

        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          
          {/* Left Column: Upload / Camera & Preview */}
          <div className="flex flex-col gap-6">
            
            {isCameraOpen ? (
              // Camera View
              <div className="relative overflow-hidden rounded-2xl border-2 border-green-500 bg-black shadow-2xl min-h-[400px] flex flex-col">
                 <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   className="w-full h-full object-cover flex-1"
                 />
                 <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={stopCamera}
                      className="p-2 bg-red-600/80 rounded-full text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={24} />
                    </button>
                 </div>
                 <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
                    <button 
                      onClick={capturePhoto}
                      className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 transition-transform"
                    >
                      <Aperture size={24} />
                      फोटो काढा (Capture)
                    </button>
                 </div>
                 {/* Scanner Overlay */}
                 <div className="absolute inset-0 border-[40px] border-black/30 pointer-events-none"></div>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-green-400/50 rounded-lg relative">
                       <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-400"></div>
                       <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-400"></div>
                       <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-400"></div>
                       <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-400"></div>
                    </div>
                 </div>
              </div>
            ) : (
              // Upload View
              <div className={`
                group relative overflow-hidden rounded-2xl border-2 border-dashed 
                ${preview ? 'border-white/20 bg-black/40' : 'border-purple-500/50 bg-purple-900/10'}
                transition-all duration-300 backdrop-blur-lg flex flex-col items-center justify-center
                min-h-[400px] shadow-2xl
              `}>
                
                {preview ? (
                  <div className="relative w-full h-full flex items-center justify-center p-2 group-hover:bg-black/40 transition-colors">
                    <img src={preview} alt="Chart Preview" className="max-h-[500px] w-auto rounded-lg shadow-lg object-contain" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 text-white font-bold text-lg bg-black/60 px-6 py-3 rounded-full backdrop-blur-md border border-white/20 hover:bg-black/80"
                      >
                        <Upload size={20} /> दुसरी इमेज (Change)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-10 w-full h-full flex flex-col justify-center items-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse">
                      <Upload size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">चार्ट अपलोड करा (Upload Chart)</h3>
                    
                    <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
                      <button 
                        onClick={handleUploadClick}
                        className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                         <Upload size={18} /> गॅलरी मधून निवडा (Gallery)
                      </button>
                      
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <div className="h-px bg-gray-700 flex-1"></div>
                        <span>OR</span>
                        <div className="h-px bg-gray-700 flex-1"></div>
                      </div>

                      <button 
                        onClick={startCamera}
                        className="w-full py-3 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                         <Camera size={18} /> कॅमेरा चालू करा (Open Camera)
                      </button>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                )}
              </div>
            )}

            {loading.status === 'analyzing' && (
               <div className="w-full p-6 rounded-xl bg-black/50 backdrop-blur-md border border-blue-500/30 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Loader2 className="animate-spin text-blue-400 w-8 h-8" />
                  <span className="text-blue-200 font-semibold text-lg animate-pulse">{loading.message}</span>
               </div>
            )}
            
            {loading.status === 'error' && (
              <div className="w-full p-4 rounded-xl bg-red-900/30 backdrop-blur-md border border-red-500/50 text-red-200 text-center">
                {loading.message}
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col">
             {result ? (
               <AnalysisDisplay data={result} />
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm min-h-[300px]">
                  <Sparkles className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-gray-500">डेटाची वाट पाहत आहे (Waiting for Data)</h3>
                  <p className="text-gray-600 max-w-sm mt-2">
                    Buy/Sell सिग्नल आणि 1 min ते 1 year पर्यंतचे मार्केट विश्लेषण पाहण्यासाठी चार्ट अपलोड करा किंवा फोटो काढा.
                    <br/>
                    (Upload chart or take photo to see Buy/Sell signals and analysis.)
                  </p>
               </div>
             )}
          </div>
          
        </div>

        {/* Disclaimer / Important Note Section */}
        <div className="w-full max-w-5xl p-6 rounded-2xl bg-yellow-900/10 backdrop-blur-xl border border-yellow-500/30 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
          <div className="flex flex-col md:flex-row gap-5 items-start">
             <div className="p-4 bg-yellow-500/10 rounded-full shrink-0 border border-yellow-500/20">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
             </div>
             <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-3 tracking-wide flex items-center gap-2">
                   महत्वाची सूचना / Important Disclaimer
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                      <strong className="text-yellow-200 block mb-1">मराठी:</strong>
                      हे AI टूल केवळ शैक्षणिक आणि तांत्रिक विश्लेषणासाठी (Technical Analysis) आहे. हे चार्टमधील पॅटर्न्स ओळखते, परंतु हा कोणताही खात्रीशीर आर्थिक सल्ला (Financial Advice) किंवा टिप नाही. शेअर मार्केटमधील गुंतवणूक ही पूर्णपणे बाजार जोखमीच्या (Market Risk) अधीन आहे. कोणताही ट्रेड घेण्यापूर्वी स्वतःचा अभ्यास करा किंवा आर्थिक सल्लागाराशी चर्चा करा. तुम्हाला होणाऱ्या कोणत्याही नफ्याला किंवा तोट्याला हे ॲप किंवा डेव्हलपर जबाबदार राहणार नाही. कृपया आपल्या जबाबदारीवर ट्रेडिंग करा.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                      <strong className="text-yellow-200/70 block mb-1">English:</strong>
                      This AI tool provides technical analysis based on chart patterns for educational purposes only. It does NOT constitute financial advice, tips, or recommendations to buy/sell. Stock market trading involves significant risk. Please conduct your own research or consult a certified financial advisor before making any investment decisions. The app developers are not responsible for any financial losses. Trade responsibly at your own risk.
                    </p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-gray-500 text-xs md:text-sm font-light text-center border-t border-white/5 pt-6 w-full max-w-3xl">
          <p>© 2024 My Market AI. Powered by Gemini AI.</p>
          <p className="mt-1 opacity-70">Trading involves risk. Analysis is generated by AI and may be incorrect.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;