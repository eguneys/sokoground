export const kInputPlanes = 56 + 2;

export function InputPlane() {

  this.mask = 0;
  this.value = 1;

  this.setAll = () => {
    this.mask = 0xffffffff;
  };

  this.fill = (val) => {
    this.setAll();
    this.value = val;
  };

}
