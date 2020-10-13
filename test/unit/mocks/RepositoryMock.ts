/* eslint-disable @typescript-eslint/no-unused-vars */
export default class RepositoryMock<T> {
  private entity: T;
  private entities: T[];

  public async find(..._args: unknown[]): Promise<T[]> {
    return Promise.resolve(this.entities);
  }

  public async findOne(..._args: unknown[]): Promise<T> {
    return Promise.resolve(this.entity);
  }

  public async save(value: T, ..._args: unknown[]): Promise<T> {
    return Promise.resolve(value);
  }

  public async delete(_value: T, ..._args: unknown[]): Promise<T> {
    return Promise.resolve(null);
  }
}
