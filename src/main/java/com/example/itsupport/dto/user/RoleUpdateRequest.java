package com.example.itsupport.dto.user;

import com.example.itsupport.entity.enums.Role;
import lombok.Data;

@Data
public class RoleUpdateRequest {
    private Role newRole;
}