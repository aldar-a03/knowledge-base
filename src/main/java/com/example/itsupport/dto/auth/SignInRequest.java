package com.example.itsupport.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Schema(description = "Запрос на аутентификацию")
public class SignInRequest {

    @Schema(description = "Электронная почта", example = "user@example.com")
    @Size(min = 5, max = 255, message = "Email должен содержать от 5 до 255 символов")
    @NotBlank(message = "Email не может быть пустым")
    @Email(message = "Email адрес должен быть в формате user@example.com")
    private String email;

    @Schema(description = "Пароль", example = "my_1secret1_password")
    @Size(min = 5, max = 100, message = "Длина пароля должна быть от 5 до 100 символов")
    @NotBlank(message = "Пароль не может быть пустыми")
    private String password;
}