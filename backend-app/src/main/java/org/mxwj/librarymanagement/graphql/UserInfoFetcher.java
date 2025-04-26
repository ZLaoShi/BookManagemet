package org.mxwj.librarymanagement.graphql;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.mxwj.librarymanagement.model.UserInfo;
import org.mxwj.librarymanagement.model.dto.CreateUserInfoDTO;
import org.mxwj.librarymanagement.model.dto.UpdateUserInfoDTO;
import org.mxwj.librarymanagement.service.UserInfoService;
import org.mxwj.librarymanagement.utils.ContextHelper;
import org.mxwj.librarymanagement.utils.DTOMapper;

import graphql.schema.DataFetcher;

public class UserInfoFetcher {
    private final UserInfoService userInfoService;

    public UserInfoFetcher(UserInfoService userInfoService) {
        this.userInfoService = userInfoService;
    }

    public DataFetcher<CompletableFuture<UserInfo>> getUserInfoById() {
        return env -> {
            Long id = Long.parseLong(env.getArgument("id"));

            return userInfoService.findById(id).subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<UserInfo>> createUserInfo() {
        return env -> {
            Map<String, Object> input = env.getArgument("input");
            CreateUserInfoDTO userInfoDto = DTOMapper.mapToDTO(input, CreateUserInfoDTO.class);

            Long accountId = ContextHelper.getAccountId(env);
            userInfoDto.setAccountId(accountId);
            
            return userInfoService.createUserInfo(userInfoDto).subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<UserInfo>> updateUserInfo() {
        return env -> {
           Map<String, Object> input = env.getArgument("input");
           UpdateUserInfoDTO userInfoDto = new UpdateUserInfoDTO();
           userInfoDto.setAccountId(ContextHelper.getAccountId(env));
           userInfoDto.setFullName((String) input.get("fullName"));
           userInfoDto.setPhone((String) input.get("phone"));
           userInfoDto.setAddress((String) input.get("address"));

           return userInfoService.updateUserInfo(userInfoDto).subscribeAsCompletionStage();
        };
    }

}

/*我觉得这里我们需要的是一种理念的确定:
上文下问sub和传入id的判断在哪一层做比较好呢?
本质上是一个鉴权问题?我们的问题很简单鉴权放在service前还是service中.
这同时涉及接口设计问题.
假如在service中鉴权那么所有的调用者都需要提供sub或者上下文对象,
由于我们使用了orm所以service层其实就是最底层了
所以我们这里的问题其实鉴权的先后来决定service的复用性如何*/

/*最好的建议区分内外接口,Fetcher使用的外部接口在service中鉴权,更内层代码使用的内部接口则不鉴权*/
