package com.yourapp.shared.config;

import com.zaxxer.hikari.HikariDataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * When DATABASE_URL is set (e.g. Render Postgres: postgresql://user:pass@host:port/dbname),
 * configures the DataSource from it so you only need one env var.
 */
@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource(@Value("${DATABASE_URL}") String databaseUrl) {
        // postgresql://user:password@host:port/database or postgres://...
        String jdbcUrl = databaseUrl;
        if (jdbcUrl.startsWith("postgres://")) {
            jdbcUrl = "postgresql://" + jdbcUrl.substring("postgres://".length());
        }
        URI uri;
        try {
            uri = new URI(jdbcUrl.replace("postgresql://", "http://"));
        } catch (Exception e) {
            throw new IllegalStateException("Invalid DATABASE_URL", e);
        }
        String host = uri.getHost();
        int port = uri.getPort() > 0 ? uri.getPort() : 5432;
        String path = uri.getPath();
        String database = path != null && path.length() > 1 ? path.substring(1) : "postgres";
        String userInfo = uri.getUserInfo();
        String username = "postgres";
        String password = "";
        if (userInfo != null) {
            int colon = userInfo.indexOf(':');
            if (colon > 0) {
                username = userInfo.substring(0, colon);
                try {
                    password = URLDecoder.decode(userInfo.substring(colon + 1), StandardCharsets.UTF_8);
                } catch (Exception e) {
                    password = userInfo.substring(colon + 1);
                }
            } else {
                username = userInfo;
            }
        }
        String jdbcConnectionUrl = "jdbc:postgresql://" + host + ":" + port + "/" + database;

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcConnectionUrl);
        ds.setUsername(username);
        ds.setPassword(password);
        return ds;
    }
}
