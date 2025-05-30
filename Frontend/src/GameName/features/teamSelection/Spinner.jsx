import { useState, useRef , forwardRef , useImperativeHandle } from 'react';

 const ColorWheel = forwardRef((props,ref)=> {
  const [spinning, setSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const wheelRef = useRef(null);
  
  const colors = [
    { name: "Red", color: "bg-red-500", textColor: "text-white" },
    { name: "Blue", color: "bg-blue-500", textColor: "text-white" },
    { name: "Yellow", color: "bg-yellow-300", textColor: "text-black" },
    { name: "Pink", color: "bg-pink-400", textColor: "text-white" },
    { name: "Orange", color: "bg-orange-400", textColor: "text-white" },
    { name: "Brown", color: "bg-yellow-800", textColor: "text-white" }
  ];
  
  const numberOfSections = colors.length;
  const sectionAngle = 360 / numberOfSections;

  useImperativeHandle(ref, () => ({
    spinWheel, // Let the parent use this function
  }));
  
  const spinWheel = () => {
    if (spinning) return;
    
    // Reset the selected color
    setSelectedColor(null);
    
    // Set spinning state
    setSpinning(true);
    
    // Generate random rotation between 2 and 5 full rotations + random angle
    const minDegrees = 720; // 2 rotations
    const maxDegrees = 1800; // 5 rotations
    const spinDegrees = Math.floor(Math.random() * (maxDegrees - minDegrees + 1)) + minDegrees;
    
    // Set new rotation degree (add to current for continuous rotation)
    setRotationDegree(rotationDegree + spinDegrees);
    
    // Wait for spin to complete
    setTimeout(() => {
      setSpinning(false);
      
      // Calculate which section the pointer landed on
      const normalizedDegree = (rotationDegree + spinDegrees) % 360;
      // Adjust the calculation to account for the wheel's rotation direction
      // We need to figure out which section is at the top (0 degrees) when the wheel stops
      const adjustedDegree = (360 - normalizedDegree) % 360;
      const sectionIndex = Math.floor(adjustedDegree / sectionAngle);
      const selectedColor = colors[sectionIndex % colors.length];
      
      setSelectedColor(selectedColor);
    //   console.log(selectedColor)
    }, 3000); // Matches the CSS transition duration
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-4">
      
      
      {/* Wheel Container */}
      <div className="relative w-64 h-64 rounded-full bg-white flex justify-center items-center">
        {/* Wheel */}
        <div 
          ref={wheelRef}
          className="absolute w-[98%] h-[98%] rounded-full overflow-hidden border-8 border-gray-900 shadow-inner shadow-black  transition-transform duration-3000 ease-out"
          style={{ transform: `rotate(${rotationDegree}deg)`, boxShadow: '0 0 25px 12px rgba(0,0,0,0.6) inset' }}
        >
        
          {/* Color Sections */}
          {colors.map((color, index) => {
            const startAngle = index * sectionAngle;
            const endAngle = (index + 1) * sectionAngle;
            
            // Create an array of points to form a complete pie section
            const generatePieSection = () => {
              // Start with center point
              let points = "50% 50%, ";
              
              // Add points along the arc (more points = smoother curve)
              const steps = 20;
              for (let i = 0; i <= steps; i++) {
                const angle = startAngle + (i / steps) * (endAngle - startAngle);
                const angleRad = Math.PI * (90 - angle) / 180;
                const x = 50 + 50 * Math.cos(angleRad);
                const y = 50 - 50 * Math.sin(angleRad);
                points += `${x}% ${y}%, `;
              }
              
              // Remove trailing comma and space
              return points.slice(0, -2);
            };
            
            // Calculate center of section for text placement
            const midAngle = (startAngle + endAngle) / 2;
            const midAngleRad = Math.PI * (90 - midAngle) / 180;
            const textX = 50 + 30 * Math.cos(midAngleRad);
            const textY = 50 - 30 * Math.sin(midAngleRad);
            
            return (
              <div 
                key={color.name}
                className={`absolute w-full h-full ${color.color}`}
                style={{ 
                  clipPath: `polygon(${generatePieSection()})`,
                }}
              >
                {/* Text positioned along radius line */}
                <div className="relative w-full h-full">
                  <div 
                    className={`absolute ${color.textColor} font-bold text-sm`}
                    style={{ 
                      left: `${textX}%`,
                      top: `${textY}%`,
                      transform: `translate(-50%, -50%) rotate(${90 + midAngle}deg)`,
                      transformOrigin: 'center',
                      width: '60px',
                      textAlign: 'center'
                    }}
                  >
                    {color.name}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Center Circle */}
          <div className="absolute rounded-full bg-white w-8 h-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 border-2 border-gray-300 shadow-[0_0_15px_1px_black]"></div>
        </div>
        
        {/* Pointer Triangle */}
        <div 
          className="absolute w-0 h-0 
                     top-[100px] left-1/2 transform -translate-x-1/2 -translate-y-1/4
                     z-20"
          style={{ borderWidth: '0 10px 20px 10px', borderStyle: 'solid', borderColor: 'transparent transparent black transparent' }}
        ></div>
      </div>
      
     
      
     
    </div>
  );
})

export default ColorWheel