import React from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';

class SnapshotButton extends React.Component {
  takeSnapshot = () => {
    // Create a container for our desktop version of the calendar
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1024px';
    document.body.appendChild(container);

    // Get the original calendar element
    const originalCalendar = document.querySelector('.mt-4.bg-white.rounded-lg.shadow-md.p-4');

    if (originalCalendar) {
      // Clone the calendar element
      const calendarClone = originalCalendar.cloneNode(true);
      
      // Force desktop styles
      calendarClone.style.width = '1024px';
      
      // Show desktop grid and hide mobile view
      const desktopGrid = calendarClone.querySelector('.hidden.md\\:grid');
      if (desktopGrid) {
        desktopGrid.classList.remove('hidden');
        desktopGrid.style.display = 'grid';
      }
      
      const mobileView = calendarClone.querySelector('.md\\:hidden');
      if (mobileView) {
        mobileView.style.display = 'none';
      }
      
      // Append the clone to the container
      container.appendChild(calendarClone);

      // Force a reflow to ensure styles are applied
      void container.offsetWidth;

      // Capture the snapshot
      html2canvas(calendarClone, { 
        scale: 2,
        width: 1024,
        height: calendarClone.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedCalendar = clonedDoc.querySelector('.mt-4.bg-white.rounded-lg.shadow-md.p-4');
          if (clonedCalendar) {
            clonedCalendar.style.width = '1024px';
            const clonedDesktopGrid = clonedCalendar.querySelector('.md\\:grid');
            if (clonedDesktopGrid) {
              clonedDesktopGrid.classList.remove('hidden');
              clonedDesktopGrid.style.display = 'grid';
            }
            const clonedMobileView = clonedCalendar.querySelector('.md\\:hidden');
            if (clonedMobileView) {
              clonedMobileView.style.display = 'none';
            }
          }
        }
      }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'calendar_snapshot.png';
        link.click();
        
        // Clean up
        document.body.removeChild(container);
      });
    } else {
      console.error('Calendar element not found');
    }
  };

  render() {
    return (
      <button onClick={this.takeSnapshot} className="relative flex items-center justify-center px-4 py-2 border border-transparent rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ml-4">
        <div className="absolute inset-0 rounded-lg bg-gray-200 opacity-50"></div>
        <div className="relative flex items-center">
          <span className="text-sm font-medium text-gray-800">Take Snapshot</span>
        </div>
      </button>
    );
  }
}

export default SnapshotButton;

