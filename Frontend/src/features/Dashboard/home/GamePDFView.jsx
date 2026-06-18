import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Printer, AlertCircle, Loader, Download } from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

const categoryConfig = {
  Collab: {
    borderColor: "#95400E",
    headerColor: "#95400E",
    bodyColor: "#95400E",
  },
  Discovery: {
    borderColor: "#0B7D85",
    headerColor: "#0795AE",
    bodyColor: "#0B7D85",
  },
  "Mind-bender": {
    borderColor: "#387902",
    headerColor: "#295B08",
    bodyColor: "#387902",
  },
  "Team Work": {
    borderColor: "#9C2A2A",
    headerColor: "#BA2732",
    bodyColor: "#9C2A2A",
  },
};

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export default function GamePDFView() {
  const { sessionId, level } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [sessionInfo, setSessionInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/session/${sessionId}/populated-questions`,
          { withCredentials: true }
        );
        if (response.data.success) {
          const allQuestions = response.data.data.selectedQuestions[level] || [];
          setQuestions(allQuestions);
          setSessionInfo({
            companyName: response.data.data.companyName,
            companyLogo: response.data.data.companyLogo,
          });
        } else {
          setError(response.data.error || "Failed to load questions");
        }
      } catch (err) {
        console.error("Error fetching PDF questions:", err);
        setError(err.response?.data?.error || "Error loading questions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionId, level]);

  // Track image caching to ensure all images render fully in PDF print
  useEffect(() => {
    if (!loading && questions.length > 0) {
      const imageUrls = questions
        .map((q) => q.questionImageUrl)
        .filter((url) => url);

      if (imageUrls.length === 0) {
        setImagesLoaded(true);
        return;
      }

      let loadedCount = 0;
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === imageUrls.length) {
            setImagesLoaded(true);
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === imageUrls.length) {
            setImagesLoaded(true);
          }
        };
      });
    } else if (!loading && questions.length === 0) {
      setImagesLoaded(true);
    }
  }, [loading, questions]);

  const [generating, setGenerating] = useState(false);

  const adjustCardPageBreaks = () => {
    const container = document.querySelector(".print-container");
    if (!container) return;

    const containerWidth = container.clientWidth;
    const pageHeight = 297 * (containerWidth / 210);

    const columns = container.querySelectorAll(".column-group");
    columns.forEach(col => {
      const cards = Array.from(col.querySelectorAll(".card-item"));
      
      // Reset margins first to measure natural positions
      cards.forEach(card => {
        card.style.marginTop = "0px";
      });

      // Measure natural positions and heights
      const cardData = cards.map(card => ({
        element: card,
        naturalTop: card.offsetTop,
        height: card.offsetHeight,
        margin: 0
      }));

      // Sort by naturalTop to ensure correct order
      cardData.sort((a, b) => a.naturalTop - b.naturalTop);

      let totalShift = 0;
      cardData.forEach((data) => {
        const currentTop = data.naturalTop + totalShift;
        
        const topPage = Math.floor(currentTop / pageHeight);
        const bottomPage = Math.floor((currentTop + data.height) / pageHeight);

        if (topPage !== bottomPage) {
          const nextPageStart = (topPage + 1) * pageHeight;
          const shift = nextPageStart - currentTop;
          totalShift += shift;
          data.margin = shift;
        }
      });

      // Apply margins back to the DOM
      cardData.forEach(data => {
        data.element.style.marginTop = `${data.margin}px`;
      });
    });
  };

  useEffect(() => {
    if (imagesLoaded && questions.length > 0) {
      setTimeout(adjustCardPageBreaks, 300);
    }
  }, [imagesLoaded, questions]);

  useEffect(() => {
    window.addEventListener("resize", adjustCardPageBreaks);
    return () => window.removeEventListener("resize", adjustCardPageBreaks);
  }, []);

  const handlePrint = async () => {
    const element = document.querySelector(".print-container");
    if (!element) return;

    try {
      setGenerating(true);
      adjustCardPageBreaks();
      // Wait a moment for layout reflow
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2, // higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.clientWidth,
        height: element.clientHeight
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 page width in mm
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Level_${level}_Questions.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const isDataLoading = loading || !imagesLoaded;

  if (isDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <Loader className="w-10 h-10 animate-spin text-[#FCA61E] mb-4" />
        <p className="text-lg font-medium font-sans">Preparing Printable PDF Layout...</p>
        <p className="text-xs text-gray-400 mt-2">Caching S3 images for high-res rendering</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error Generating Preview</h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={() => navigate(`/admin/${sessionId}`)}
          className="bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Distribute questions into 3 columns
  const col1 = [];
  const col2 = [];
  const col3 = [];
  
  questions.forEach((q, idx) => {
    if (idx % 3 === 0) col1.push(q);
    else if (idx % 3 === 1) col2.push(q);
    else col3.push(q);
  });

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-0 sm:p-8">
      {/* Floating Controller Top-Bar */}
      <div className="max-w-5xl mx-auto mb-6 bg-slate-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/${sessionId}`)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-base">Level {level} Print Preview</h2>
            <p className="text-xs text-gray-400">Review layout then click Save PDF to download directly</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          disabled={generating}
          className="bg-[#FCA61E] hover:bg-[#e09312] text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {generating ? "Generating..." : "Save PDF"}
        </button>
      </div>

      {/* Printable Sheet Area */}
      <div
        className="print-container max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl p-8 relative pb-12"
        style={{
          width: "210mm",
          boxSizing: "border-box",
          minHeight: "297mm",
        }}
      >
        {/* Top Title Banner */}
        <div className="flex flex-col items-center border-b-[3px] border-gray-100 pb-5 mb-8 select-none w-full">
          {/* Company Logo and Name on Top */}
          {sessionInfo.companyName && (
            <div className="flex items-center justify-center gap-3 mb-3">
              {sessionInfo.companyLogo && (
                <img
                  src={sessionInfo.companyLogo}
                  alt="company logo"
                  className="h-16 w-auto object-contain rounded"
                />
              )}
              <span className="text-lg font-black text-gray-800 tracking-widest uppercase">
                {sessionInfo.companyName}
              </span>
            </div>
          )}
          
          {/* Level and Title on the next line */}
          <div className="flex items-center justify-center gap-4">
            <div className="bg-[#23203E] text-white font-extrabold text-[13px] tracking-wide uppercase px-3 py-1.5 rounded-lg shadow-sm border border-white/10">
              Level {level}
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-[1.5px] text-[#FCA61E] select-none" style={{ fontFamily: '"Poppins", "Arial", sans-serif' }}>
              THE ULTIMATE TEAM CHALLENGE
            </h1>
          </div>
        </div>

        {/* 3-Column Independent Flex Layout */}
        <div className="flex gap-5 mt-4 select-none">
          {/* Column 1 */}
          <div className="column-group flex-1 flex flex-col gap-5">
            {col1.map((question) => {
              const config = categoryConfig[question.category] || categoryConfig["Mind-bender"];
              const isMindBender = question.category === "Mind-bender";

              return (
                <div
                  key={question._id}
                  className="card-item relative w-full flex flex-col rounded-[8px] overflow-hidden border bg-white shadow-sm"
                  style={{
                    borderColor: config.borderColor,
                    borderWidth: "1.5px",
                  }}
                >
                  {/* Card S3 Image */}
                  <div className={`w-full bg-gray-50 border-b border-gray-100 overflow-hidden relative ${isMindBender ? 'pl-[24px]' : ''}`}>
                    {isMindBender && (
                      <div
                        className="absolute left-0 top-0 h-full w-[24px] z-10 flex items-center justify-center font-bold text-white text-[9px] uppercase tracking-wider select-none"
                        style={{ 
                          backgroundColor: config.headerColor,
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)"
                        }}
                      >
                        Mind-bender
                      </div>
                    )}
                    {!isMindBender && (
                      <div
                        className={`absolute top-0 ${question.category === 'Discovery' ? 'right-0 rounded-bl-[8px]' : 'left-0 rounded-br-[8px]'} z-10 px-3 py-1.5 text-[9px] font-bold text-white uppercase tracking-wider`}
                        style={{ backgroundColor: config.headerColor }}
                      >
                        {question.category}
                      </div>
                    )}
                    {question.questionImageUrl ? (
                      <img
                        src={question.questionImageUrl}
                        className="w-full h-auto object-contain"
                        alt={question.category}
                      />
                    ) : (
                      <div className="w-full h-[150px] flex items-center justify-center bg-gray-200 text-gray-400 text-xs font-mono">
                        No Image Configured
                      </div>
                    )}
                  </div>

                  {/* Card Colored Description Body & Points */}
                  <div
                    className="p-3.5 text-white flex flex-col justify-between items-center text-center"
                    style={{ backgroundColor: config.bodyColor }}
                  >
                    <p className="text-[13px] leading-[18px] font-sans font-bold select-text mb-3 text-white">
                      {question.text}
                    </p>
                    <div className="text-[12px] font-extrabold font-mono tracking-wider text-white border-t border-white/20 pt-1.5 w-full">
                      Points: {question.points}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="column-group flex-1 flex flex-col gap-5">
            {col2.map((question) => {
              const config = categoryConfig[question.category] || categoryConfig["Mind-bender"];
              const isMindBender = question.category === "Mind-bender";

              return (
                <div
                  key={question._id}
                  className="card-item relative w-full flex flex-col rounded-[8px] overflow-hidden border bg-white shadow-sm"
                  style={{
                    borderColor: config.borderColor,
                    borderWidth: "1.5px",
                  }}
                >
                  {/* Card S3 Image */}
                  <div className={`w-full bg-gray-50 border-b border-gray-100 overflow-hidden relative ${isMindBender ? 'pl-[24px]' : ''}`}>
                    {isMindBender && (
                      <div
                        className="absolute left-0 top-0 h-full w-[24px] z-10 flex items-center justify-center font-bold text-white text-[9px] uppercase tracking-wider select-none"
                        style={{ 
                          backgroundColor: config.headerColor,
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)"
                        }}
                      >
                        Mind-bender
                      </div>
                    )}
                    {!isMindBender && (
                      <div
                        className={`absolute top-0 ${question.category === 'Discovery' ? 'right-0 rounded-bl-[8px]' : 'left-0 rounded-br-[8px]'} z-10 px-3 py-1.5 text-[9px] font-bold text-white uppercase tracking-wider`}
                        style={{ backgroundColor: config.headerColor }}
                      >
                        {question.category}
                      </div>
                    )}
                    {question.questionImageUrl ? (
                      <img
                        src={question.questionImageUrl}
                        className="w-full h-auto object-contain"
                        alt={question.category}
                      />
                    ) : (
                      <div className="w-full h-[150px] flex items-center justify-center bg-gray-200 text-gray-400 text-xs font-mono">
                        No Image Configured
                      </div>
                    )}
                  </div>

                  {/* Card Colored Description Body & Points */}
                  <div
                    className="p-3.5 text-white flex flex-col justify-between items-center text-center"
                    style={{ backgroundColor: config.bodyColor }}
                  >
                    <p className="text-[13px] leading-[18px] font-sans font-bold select-text mb-3 text-white">
                      {question.text}
                    </p>
                    <div className="text-[12px] font-extrabold font-mono tracking-wider text-white border-t border-white/20 pt-1.5 w-full">
                      Points: {question.points}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 3 */}
          <div className="column-group flex-1 flex flex-col gap-5">
            {col3.map((question) => {
              const config = categoryConfig[question.category] || categoryConfig["Mind-bender"];
              const isMindBender = question.category === "Mind-bender";

              return (
                <div
                  key={question._id}
                  className="card-item relative w-full flex flex-col rounded-[8px] overflow-hidden border bg-white shadow-sm"
                  style={{
                    borderColor: config.borderColor,
                    borderWidth: "1.5px",
                  }}
                >
                  {/* Card S3 Image */}
                  <div className={`w-full bg-gray-50 border-b border-gray-100 overflow-hidden relative ${isMindBender ? 'pl-[24px]' : ''}`}>
                    {isMindBender && (
                      <div
                        className="absolute left-0 top-0 h-full w-[24px] z-10 flex items-center justify-center font-bold text-white text-[9px] uppercase tracking-wider select-none"
                        style={{ 
                          backgroundColor: config.headerColor,
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)"
                        }}
                      >
                        Mind-bender
                      </div>
                    )}
                    {!isMindBender && (
                      <div
                        className={`absolute top-0 ${question.category === 'Discovery' ? 'right-0 rounded-bl-[8px]' : 'left-0 rounded-br-[8px]'} z-10 px-3 py-1.5 text-[9px] font-bold text-white uppercase tracking-wider`}
                        style={{ backgroundColor: config.headerColor }}
                      >
                        {question.category}
                      </div>
                    )}
                    {question.questionImageUrl ? (
                      <img
                        src={question.questionImageUrl}
                        className="w-full h-auto object-contain"
                        alt={question.category}
                      />
                    ) : (
                      <div className="w-full h-[150px] flex items-center justify-center bg-gray-200 text-gray-400 text-xs font-mono">
                        No Image Configured
                      </div>
                    )}
                  </div>

                  {/* Card Colored Description Body & Points */}
                  <div
                    className="p-3.5 text-white flex flex-col justify-between items-center text-center"
                    style={{ backgroundColor: config.bodyColor }}
                  >
                    <p className="text-[13px] leading-[18px] font-sans font-bold select-text mb-3 text-white">
                      {question.text}
                    </p>
                    <div className="text-[12px] font-extrabold font-mono tracking-wider text-white border-t border-white/20 pt-1.5 w-full">
                      Points: {question.points}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
