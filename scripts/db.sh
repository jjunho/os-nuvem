#!/bin/sh
# Local PostgreSQL for development and tests, kept inside the project.
set -eu
export LC_ALL=C
PGBIN="${PGBIN:-/opt/homebrew/opt/postgresql@16/bin}"
PGDATA="$(pwd)/.data/pg"
PGPORT="${PGPORT:-54329}"

case "${1:-}" in
  start)
    if [ ! -d "$PGDATA" ]; then
      mkdir -p "$PGDATA"
      "$PGBIN/initdb" -D "$PGDATA" -U corealux --auth=trust --encoding=UTF8 --locale=C >/dev/null
    fi
    if ! "$PGBIN/pg_isready" -h localhost -p "$PGPORT" >/dev/null 2>&1; then
      "$PGBIN/pg_ctl" -D "$PGDATA" -l "$PGDATA/server.log" -o "-p $PGPORT -k /tmp" -w start >/dev/null
    fi
    for db in corealux corealux_test; do
      "$PGBIN/psql" -h localhost -p "$PGPORT" -U corealux -d postgres -tAc "select 1 from pg_database where datname='$db'" | grep -q 1 \
        || "$PGBIN/createdb" -h localhost -p "$PGPORT" -U corealux "$db"
    done
    echo "PostgreSQL on localhost:$PGPORT"
    ;;
  stop)
    "$PGBIN/pg_ctl" -D "$PGDATA" -w stop >/dev/null && echo stopped
    ;;
  *) echo "usage: db.sh start|stop" >&2; exit 1 ;;
esac
