import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UserFromFoodOrdering {
  id: number;
  username: string;
  name: string;
  role: string;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly foodOrderingUrl: string;

  constructor(private configService: ConfigService) {
    this.foodOrderingUrl =
      this.configService.get<string>('FOOD_ORDERING_SERVICE_URL') ||
      'http://localhost:3001';
  }

  async validateUser(userId: number): Promise<UserFromFoodOrdering | null> {
    try {
      // Call food-ordering service to validate user
      const response = await fetch(
        `${this.foodOrderingUrl}/api/auth/users/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        this.logger.warn(`Failed to validate user ${userId} from food-ordering service`);
        // Return mock user for development
        return this.getMockUser(userId);
      }

      const user = await response.json();
      return user;
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`);
      // Return mock user for development when service is unavailable
      return this.getMockUser(userId);
    }
  }

  private getMockUser(userId: number): UserFromFoodOrdering {
    // Mock users for development
    const mockUsers: Record<number, UserFromFoodOrdering> = {
      1: { id: 1, username: 'admin', name: 'Admin User', role: 'ADMIN', isActive: true },
      2: { id: 2, username: 'staff', name: 'Staff User', role: 'STAFF', isActive: true },
      3: { id: 3, username: 'chef', name: 'Chef User', role: 'CHEF', isActive: true },
    };

    return mockUsers[userId] || mockUsers[1];
  }

  async getAllUsersFromFoodOrdering(): Promise<UserFromFoodOrdering[]> {
    try {
      const response = await fetch(`${this.foodOrderingUrl}/api/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn('Failed to get users from food-ordering service');
        return this.getMockUsers();
      }

      const users = await response.json();
      return users;
    } catch (error) {
      this.logger.error(`Error getting users: ${error.message}`);
      return this.getMockUsers();
    }
  }

  private getMockUsers(): UserFromFoodOrdering[] {
    return [
      { id: 1, username: 'admin', name: 'Admin User', role: 'ADMIN', isActive: true },
      { id: 2, username: 'staff', name: 'Staff User', role: 'STAFF', isActive: true },
      { id: 3, username: 'chef', name: 'Chef User', role: 'CHEF', isActive: true },
    ];
  }
}
