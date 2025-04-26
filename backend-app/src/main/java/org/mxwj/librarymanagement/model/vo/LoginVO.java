package org.mxwj.librarymanagement.model.vo;

import lombok.Builder;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoginVO {
    private String token;
    private String username;
}
