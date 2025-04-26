package org.mxwj.librarymanagement.model;

import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AccountPage {
    private List<Account> content;
    private PageInfo pageInfo;
}