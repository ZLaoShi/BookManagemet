package org.mxwj.librarymanagement.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true)
    private String email;
    
    @Column(name = "user_type")
    private Integer userType;     // 0:普通用户, 1:管理员

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    
    @Column(name = "last_login")
    private OffsetDateTime lastLogin;
   
    @Column(name = "status")
    private Integer status;  // 1:正常, 0:禁用
}