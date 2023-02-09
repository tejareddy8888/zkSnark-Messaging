#!/bin/zsh
set -e

# compile the circuit
zokrates compile -i circuit.zok -o ./out/circuit

# initialize the ceremony
# this step requires phase1 files eg. phase1radix2m2 for circuits of 2^2 constraints
zokrates mpc init -i ./out/circuit -o ./out/mpc.params -r ./phase1radix2m2

# first contribution
zokrates mpc contribute -i ./out/mpc.params -o ./out/alice.params -e "alice 1"

# second contribution
zokrates mpc contribute -i ./out/alice.params -o ./out/bob.params -e "bob 2"

# third contribution
zokrates mpc contribute -i ./out/bob.params -o ./out/charlie.params -e "charlie 3"

# apply a random beacon
zokrates mpc beacon -i ./out/charlie.params -o ./out/final.params -h b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 -n 10

# verify contributions
zokrates mpc verify -i ./out/final.params -c circuit -r ./phase1radix2m2

# export keys from final parameters (proving and verification key)
zokrates mpc export -i ./out/final.params