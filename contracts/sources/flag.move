module ctf::flag;

use std::string::String;

public struct Flag has key, store {
  id: UID,
  source: String
}

public(package) fun new(source: String, ctx: &mut TxContext): Flag {
  Flag {
    id: object::new(ctx),
    source
  }
}

public fun delete(flag: Flag) {
  let Flag { id, source: _ } = flag;
  object::delete(id);
}
