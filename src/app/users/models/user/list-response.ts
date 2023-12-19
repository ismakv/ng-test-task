import { UserDto } from "./user";

export interface UserListResponseDto {
    total_count: number;
    items: UserDto[];
}
