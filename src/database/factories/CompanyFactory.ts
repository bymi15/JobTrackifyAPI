import { Company } from '../../api/entities/Company';
import * as faker from 'faker';

export default (data?: Company): Company => {
  const company = new Company({
    name: (data && data.name) || faker.company.companyName(),
    description: (data && data.description) || faker.company.catchPhrase(),
    logo: (data && data.logo) || faker.image.business(),
    type: (data && data.type) || faker.company.bsNoun(),
    website: (data && data.website) || faker.internet.url(),
    headquarters:
      (data && data.headquarters) ||
      faker.address.city() + ', ' + faker.address.country(),
    country: (data && data.country) || faker.address.country(),
    industry: (data && data.industry) || faker.company.bsNoun(),
    foundedYear: (data && data.foundedYear) || faker.date.past().getFullYear(),
    linkedInUrl: (data && data.linkedInUrl) || faker.internet.url(),
    sizeRange:
      (data && data.sizeRange) ||
      faker.random.number(50) + ' - ' + faker.random.number(10000),
    currentEmployeeEstimate:
      (data && data.currentEmployeeEstimate) || faker.random.number(5000),
    totalEmployeeEstimate:
      (data && data.totalEmployeeEstimate) || faker.random.number(5000),
  });
  return company;
};
