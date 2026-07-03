export type UserRole = 'user' | 'property_lister' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  images: string[];
  owner: User | string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePropertyInput {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  images: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  _id: string;
  property: Property | string;
  guest: User | string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string;
}

export interface CreateBookingInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
}

export interface Review {
  _id: string;
  property: string;
  user: Pick<User, '_id' | 'name'> | string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface CreateReviewInput {
  propertyId: string;
  rating: number;
  comment: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface AdminStats {
  users: number;
  properties: number;
  bookings: number;
}

export interface UploadResponse {
  urls: string[];
}

export interface Booking {
  _id: string;
  property: Property | string;
  guest: User | string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string;
}