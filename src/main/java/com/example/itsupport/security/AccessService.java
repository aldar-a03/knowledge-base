package com.example.itsupport.security;

import com.example.itsupport.entity.Material;
import com.example.itsupport.entity.User;
import com.example.itsupport.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component("accessService")
@RequiredArgsConstructor
public class AccessService {

    private final MaterialRepository materialRepository;

    public boolean canEditOrDeleteMaterial(Material material, UserDetails userDetails) {
        if (!(userDetails instanceof CustomUserDetails customUser)) //приводим объект к нужному типу
             {
            return false;
        }

        boolean isAdmin = customUser.getRole().name().equals("ROLE_ADMIN");
        boolean isAuthor = material.getUser().getId().equals(customUser.getId());

        return isAdmin || isAuthor;
    }
}
