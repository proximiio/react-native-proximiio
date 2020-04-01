#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <Proximiio/Proximiio.h>

@interface ProximiioNative : RCTEventEmitter <RCTBridgeModule, ProximiioDelegate>

@end
