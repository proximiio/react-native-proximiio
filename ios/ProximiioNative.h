#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "ProximiioNative.h"
@import Proximiio;

@interface ProximiioNative : RCTEventEmitter <RCTBridgeModule, ProximiioDelegate>

@end
