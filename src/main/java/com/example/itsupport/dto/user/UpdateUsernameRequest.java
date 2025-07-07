package com.example.itsupport.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateUsernameRequest {
    @NotBlank(message = "Имя не должно быть пустым")
    private String fullName;
}
