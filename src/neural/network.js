export function InputPlane() {

  this.mask = 0;
  this.value = 1;

  this.setAll = () => {
    this.mask = 0xffffff;
  };

  this.fill = (val) => {
    this.setAll();
    this.value = val;
  };

}
