package org.mxwj.librarymanagement.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsersPage {
    private List<User> content;
    private PageInfo pageInfo;
}
