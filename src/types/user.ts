export interface UserProfile {
  uid: string
  fullName: string
  email: string
  username: string
  location: string
  dateOfBirth: string
  profilePhotoUrl: string
  bio: string
  followers: number
  following: number
  postsCount: number
  createdAt: number
  isOnline: boolean
}

export interface SignupFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  username: string
  location: string
  dateOfBirth: string
}
