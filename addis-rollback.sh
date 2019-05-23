mvn liquibase:clearCheckSums \
  -Dliquibase.changeLogFile=database.sql \
  -Dliquibase.driver=org.postgresql.Driver \
  -Dliquibase.url=jdbc:postgresql://localhost/addiscore \
  -Dliquibase.username=addiscore \
  -Dliquibase.password=develop
mvn liquibase:rollback \
  -Dliquibase.rollbackCount=1 \
  -Dliquibase.changeLogFile=database.sql \
  -Dliquibase.driver=org.postgresql.Driver \
  -Dliquibase.url=jdbc:postgresql://localhost/addiscore \
  -Dliquibase.username=addiscore \
  -Dliquibase.password=develop
