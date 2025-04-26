package org.mxwj.librarymanagement.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountStatusDTO {
    private Long id;
    private Integer status;
}
