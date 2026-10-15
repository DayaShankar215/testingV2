package com.secureshield.phishing_backend.scan.user.mapper;

import com.secureshield.backend.model.UserResponse;
import com.secureshield.phishing_backend.scan.user.domain.User;
import com.secureshield.phishing_backend.scan.user.entity.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuthMapper {

    UserEntity toEntity(User user);

    User toDomain(UserEntity entity);

    UserResponse toResponse(User user);
}
