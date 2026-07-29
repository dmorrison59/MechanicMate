const currentYear = new Date().getFullYear();
export const YEARS = Array.from({ length: 30 }, (_, i) =>
  String(currentYear - i)
);

export const MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'GMC', 'Ram', 'Dodge',
  'Jeep', 'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Volkswagen',
  'BMW', 'Mercedes-Benz', 'Mazda', 'Buick', 'Cadillac', 'Lexus',
  'Acura', 'Audi', 'Volvo', 'Tesla', 'Mitsubishi', 'Chrysler',
  'Lincoln', 'Infiniti', 'Genesis', 'Porsche', 'Mini',
];