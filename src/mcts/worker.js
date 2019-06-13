export default function SearchWorker(search) {
  
  const executeOneIteration = () => {
    console.log('iterate');
  };

  this.Run = () => {
    function step() {
      executeOneIteration();
      if (search.isSearchActive()) {
        setTimeout(step, 0);
      }
    }
    step();
  };
  
}
