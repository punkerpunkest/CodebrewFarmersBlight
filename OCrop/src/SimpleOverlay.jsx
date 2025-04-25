import React from 'react';

const ThermostatsUI = ({ temperature = 72, humidity = 45 }) => {
  // Color calculation for temperature
  const getTempColor = (temp) => {
    // Blue for cold, red for hot
    if (temp < 60) return '#3b82f6'; // Blue
    if (temp > 80) return '#ef4444'; // Red
    return '#f97316'; // Orange for middle range
  };
  
  // Color calculation for humidity
  const getHumidityColor = (humid) => {
    // Yellow for dry, blue for humid
    if (humid < 30) return '#eab308'; // Yellow
    if (humid > 70) return '#3b82f6'; // Blue
    return '#22c55e'; // Green for middle range
  };

  return (
    <div style={{
      position: 'fixed',
      left: '16px',
      top: '25%',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      zIndex: 10
    }}>
      {/* Thermostat */}
      <div style={{
        width: '128px',
        height: '128px',
        borderRadius: '50%',
        backgroundColor: '#1f2937',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '4px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            color: getTempColor(temperature),
            fontSize: '24px',
            fontWeight: 'bold',
            zIndex: 1
          }}>
            {temperature}°F
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: `${Math.min(100, Math.max(0, (temperature - 50) * 2))}%`,
            background: `linear-gradient(to top, ${getTempColor(temperature)}, ${getTempColor(temperature + 10)})`,
            opacity: 0.7,
            transition: 'height 0.5s ease-out'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: '-8px',
          fontSize: '14px',
          color: 'white'
        }}>
          <div style={{ position: 'absolute', top: 0 }}>90°</div>
          <div style={{ position: 'absolute', top: '25%' }}>80°</div>
          <div style={{ position: 'absolute', top: '50%' }}>70°</div>
          <div style={{ position: 'absolute', top: '75%' }}>60°</div>
          <div style={{ position: 'absolute', bottom: 0 }}>50°</div>
        </div>
        <div style={{
          position: 'absolute',
          top: '4px',
          width: '100%',
          textAlign: 'center',
          fontSize: '14px',
          color: 'white',
          fontWeight: '600'
        }}>
          TEMP
        </div>
      </div>
      
      {/* Humidity Gauge */}
      <div style={{
        width: '128px',
        height: '128px',
        borderRadius: '50%',
        backgroundColor: '#1f2937',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '4px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            color: getHumidityColor(humidity),
            fontSize: '24px',
            fontWeight: 'bold',
            zIndex: 1
          }}>
            {humidity}%
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: `${humidity}%`,
            background: `linear-gradient(to top, ${getHumidityColor(humidity - 20)}, ${getHumidityColor(humidity)})`,
            opacity: 0.7,
            transition: 'height 0.5s ease-out'
          }} />
        </div>
        <div style={{
          position: 'absolute',
          left: '-8px',
          fontSize: '14px',
          color: 'white'
        }}>
          <div style={{ position: 'absolute', top: 0 }}>100%</div>
          <div style={{ position: 'absolute', top: '25%' }}>75%</div>
          <div style={{ position: 'absolute', top: '50%' }}>50%</div>
          <div style={{ position: 'absolute', top: '75%' }}>25%</div>
          <div style={{ position: 'absolute', bottom: 0 }}>0%</div>
        </div>
        <div style={{
          position: 'absolute',
          top: '4px',
          width: '100%',
          textAlign: 'center',
          fontSize: '14px',
          color: 'white',
          fontWeight: '600'
        }}>
          HUMIDITY
        </div>
      </div>
    </div>
  );
};

export default ThermostatsUI;