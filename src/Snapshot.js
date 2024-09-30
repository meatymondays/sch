import React from 'react';
import ReactDOM from 'react-dom';
import html2canvas from 'html2canvas';
import ScheduleComp from './ScheduleComp';  // Adjust this import path as needed

class SnapshotButton extends React.Component {
  takeSnapshot = () => {
    // Create a container for our landscape version
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1024px';  // Force a width larger than 765px
    container.style.height = 'auto';
    document.body.appendChild(container);

    // Render the landscape version of the ScheduleComp
    ReactDOM.render(
      <ScheduleComp forceDesktop={true} />,
      container,
      () => {
        // After rendering, find the calendar element within the rendered component
        const calendarElement = container.querySelector('.mt-4.bg-white.rounded-lg.shadow-md.p-4');
        
        if (calendarElement) {
          // Ensure landscape view is shown
          const landscapeView = calendarElement.querySelector('.md\\:grid');
          if (landscapeView) {
            landscapeView.style.display = 'grid';
            landscapeView.style.paddingBottom = '20px';  // Add padding to the bottom
          }

          // Capture the snapshot of the landscape view only
          html2canvas(landscapeView, { 
            scale: 2,
            width: 1024,
            height: landscapeView.offsetHeight
          }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'calendar_snapshot.png';
            link.click();
            
            // Clean up
            ReactDOM.unmountComponentAtNode(container);
            document.body.removeChild(container);
          });
        } else {
          console.error('Calendar element not found in rendered component');
          ReactDOM.unmountComponentAtNode(container);
          document.body.removeChild(container);
        }
      }
    );
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

