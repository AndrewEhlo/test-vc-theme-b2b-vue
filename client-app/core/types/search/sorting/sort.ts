import { SortDirection } from "../../../enums";
import { SearchEntity } from "../../../types/search/entity";

export class Sort extends SearchEntity {
  constructor(public fieldName: string = "createdDate", public direction: SortDirection = SortDirection.Descending) {
    super();
  }

  toggle(): SortDirection {
    return this.direction === SortDirection.Ascending ? SortDirection.Ascending : SortDirection.Descending;
  }

  override toString(): string {
    return `${this.fieldName}:${this.direction}`;
  }

  static fromString(str: string): Sort {
    const [fieldName, direction] = str.split(":");
    let result: Sort;
    if (fieldName && direction && (direction == SortDirection.Ascending || direction == SortDirection.Descending)) {
      result = new Sort(fieldName, direction as SortDirection);
    } else {
      result = new Sort();
    }
    return result;
  }
}