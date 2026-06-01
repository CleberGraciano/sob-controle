package com.sobcontrole.finance.security;

import com.sobcontrole.finance.config.ApplicationProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final ApplicationProperties properties;

    public JwtService(ApplicationProperties properties) {
        this.properties = properties;
    }

    public String generateToken(AuthenticatedUser authenticatedUser) {
        Instant now = Instant.now();
        Instant expiration = now.plus(properties.jwt().expirationMinutes(), ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(authenticatedUser.getUsername())
                .claim("role", authenticatedUser.getUser().getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(signingKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public boolean isTokenValid(String token, AuthenticatedUser authenticatedUser) {
        Claims claims = extractClaims(token);
        return claims.getSubject().equalsIgnoreCase(authenticatedUser.getUsername())
                && claims.getExpiration().after(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key signingKey() {
        String secret = properties.jwt().secret();
        if (secret.length() >= 32) {
            return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}