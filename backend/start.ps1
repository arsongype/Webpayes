$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:MAVEN_OPTS = "-Xmx1g"
Set-Location "D:\M2 STAGE\payment-online\backend"
& "C:\Program Files\apache-maven-3.9.14\bin\mvn.cmd" spring-boot:run -DskipTests
