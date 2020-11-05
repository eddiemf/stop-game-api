export abstract class ValueObject<ValueType> {
  private value: ValueType;

  constructor(value: ValueType) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
